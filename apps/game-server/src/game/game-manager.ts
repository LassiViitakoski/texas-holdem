import { db } from '@texas-holdem/database-api';
import { z } from 'zod';
import { Game } from './game';
import { Player } from './player';
import type { EventHandlerMap } from '../types';
import { socketManager } from '../services/socket-manager';

const schemas = {
  joinGame: z.object({
    gameId: z.number(),
    buyIn: z.number(),
    userId: z.number(),
  }),
  leaveGame: z.object({
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
    GAME_JOIN: {
      schema: schemas.joinGame,
      handler: this.handleGameJoin.bind(this),
    },
    GAME_LEAVE: {
      schema: schemas.leaveGame,
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
      players: players.map(({ user, ...player }) => new Player({ ...player, username: user.username })),
      blinds: blinds.sort((a, b) => a.sequence - b.sequence),
    }));

    this.initialized = true;
  }

  public handleGameCreated(payload: Awaited<ReturnType<typeof db.game.create>>) {
    console.log('Handle game created', payload);
  }

  public async handleGameJoin(socketId: string, payload: z.infer<typeof schemas.joinGame>) {
    const { gameId, buyIn, userId } = payload;

    const game = this.getGame(gameId);

    if (!game) {
      throw new Error('Game not found on {handleGameJoin()}');
    }

    const { user, ...playerDetails } = await db.player.create({
      gameId,
      stack: buyIn,
      userId,
    });

    const player = new Player({
      ...playerDetails,
      username: user.username,
    });

    game.join(player);
    socketManager.addUserToGameRoom(gameId, userId, socketId);
    socketManager.emitGameEvent(gameId, {
      type: 'PLAYER_JOINED',
      payload: {
        playerId: player.id,
        name: user.username,
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

    game.startNewRound().then((round) => {
      round.players.forEach((roundPlayer) => {
        const roundPlayerUserId = game.players.find((p) => p.id === roundPlayer.playerId)?.userId;

        if (!roundPlayerUserId) {
          throw new Error('User not found on {handleGameJoin()}');
        }

        socketManager.emitUserEvent(
          game.id,
          roundPlayerUserId,
          {
            type: 'ROUND_STARTED',
            payload: {
              roundId: round.id,
              cards: roundPlayer.cards,
            },
          },
        );
      });
    });
  }

  public handleGameLeave(_: string, payload: z.infer<typeof schemas.leaveGame>) {
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
