import { db } from '@texas-holdem/database-api';
import { z } from 'zod';
import { Game } from './game';
import { Player } from './player';
import type { EventHandlerMap } from '../types';
import { socketManager } from '../services/socket-manager';
import { TablePosition } from './table-position';

const schemas = {
  gameJoin: z.object({
    gameId: z.number(),
    buyIn: z.number(),
    userId: z.number(),
    position: z.number(),
  }),
  gameRoomJoin: z.object({
    gameId: z.number(),
    userId: z.number(),
  }),
  gameLeave: z.object({
    gameId: z.number(),
    userId: z.number(),
  }),
};

export type MessageBrokerGameEvents = {
  GAME_CREATED: Awaited<ReturnType<typeof db.game.create>>;
};

export class GameManager {
  private static instance: GameManager;

  private games: Game[] = []; // Good for < 1000 games

  private initialized: boolean = false;

  /**
   * @description Socket events with Zod validation schemas for runtime type checking of browser messages
   */
  public readonly socketEvents = {
    GAME_ROOM_JOIN: {
      schema: schemas.gameRoomJoin,
      handler: this.handeGameRoomJoin.bind(this),
    },
    GAME_JOIN: {
      schema: schemas.gameJoin,
      handler: this.handleGameJoin.bind(this),
    },
    GAME_LEAVE: {
      schema: schemas.gameLeave,
      handler: this.handleGameLeave.bind(this),
    },
  } as const;

  /**
   * @description Message broker event handlers for server-to-server communication
   */
  public readonly messageBrokerEvents: EventHandlerMap<MessageBrokerGameEvents> = {
    GAME_CREATED: this.handleGameCreated.bind(this),
  } as const;

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.games.length > 0) {
      console.error('Game manager already running, unable to initialize after games already contains items.');
      return;
    }

    const games = await db.game.findActiveGames();

    // TODO for later: figure out how to initialize game with active round ongoing.
    this.games = games.map(({
      blinds,
      players,
      rounds,
      tablePositions,
      ...gameDetails
    }) => new Game({
      ...gameDetails,
      players: new Map(players.map(({ user, ...player }) => [
        player.id,
        new Player({ ...player, username: user.username }),
      ])),
      blinds: blinds.sort((a, b) => a.position - b.position),
      tablePositions: tablePositions.map((tablePos) => new TablePosition(tablePos)),
    }));

    this.initialized = true;
  }

  public handleGameCreated(payload: Awaited<ReturnType<typeof db.game.create>>) {
    const {
      blinds, players, tablePositions, ...gameDetails
    } = payload;

    const game = new Game({
      ...gameDetails,
      tablePositions: tablePositions.map((tPosition) => new TablePosition(tPosition)),
      players: new Map(players.map(({ user, ...player }) => [
        player.id,
        new Player({ ...player, username: user.username }),
      ])),
      blinds: blinds.sort((a, b) => a.position - b.position),
    });

    this.addGame(game);
  }

  public async handleGameJoin(socketId: string, payload: z.infer<typeof schemas.gameJoin>) {
    const {
      gameId, buyIn, userId, position,
    } = payload;

    const game = this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found on {handleGameJoin()}');
    }

    if (game.isFull()) {
      throw new Error('Game is full on {handleGameJoin()}');
    }

    if (!game.isPositionAvailable(position)) {
      throw new Error('Position is not available on {handleGameJoin()}');
    }

    const {
      user: userDetails,
      tablePosition: tablePositionDetails,
      ...playerDetails
    } = await db.player.create({
      gameId,
      stack: buyIn,
      userId,
      position,
    });

    const player = new Player({ ...playerDetails, username: userDetails.username });
    game.join({
      player,
      tablePosition: new TablePosition({ ...tablePositionDetails[0], playerId: player.id }),
    });

    socketManager.addUserToGameRoom(gameId, userId, socketId);
    socketManager.emitGameEvent(gameId, {
      type: 'PLAYER_JOINED',
      payload: {
        playerId: player.id,
        name: userDetails.username,
        stack: playerDetails.stack,
      },
    });

    if (game.activeRound) {
      return;
    }

    if (!game.isReadyToStart()) {
      socketManager.emitGameEvent(gameId, {
        type: 'NOT_READY_TO_START',
        payload: {
          gameId,
          reason: 'WAITING_FOR_PLAYERS',
        },
      });
      return;
    }

    await game.initiateNewRound();
  }

  public handeGameRoomJoin(socketId: string, payload: z.infer<typeof schemas.gameRoomJoin>) {
    const { gameId, userId } = payload;
    socketManager.addUserToGameRoom(gameId, userId, socketId, true);
    socketManager.emitUserEvent(gameId, userId, {
      type: 'GAME_ROOM_JOIN_SUCCESS',
      payload: {
        game: JSON.parse(JSON.stringify(this.getGame(gameId))),
      },
    });
  }

  public handleGameLeave(_: string, payload: z.infer<typeof schemas.gameLeave>) {
    const { gameId, userId } = payload;
    const activeGame = this.getGame(gameId);

    if (!activeGame) {
      throw new Error('Game not found on {handleGameLeave()}');
    }

    socketManager.removeUserFromGameRoom(gameId, userId);
  }

  public addGame(game: Game): void {
    // TODO: Could be validated that game does not already exist

    this.games.push(game);
  }

  public removeGame(gameId: number): void {
    this.games = this.games.filter((game) => game.id !== gameId);
  }

  public getGame(gameId: number): Game | undefined {
    return this.games.find((game) => game.id === gameId);
  }

  public getAllGames(): Game[] {
    return this.games;
  }

  public getWaitingGames() {
    return this.games.filter((game) => !game.activeRound);
  }

  public getActiveGames() {
    return this.games.filter((game) => game.activeRound);
  }
}

export const gameManager = GameManager.getInstance();
