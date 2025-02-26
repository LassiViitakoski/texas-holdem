import { DatabaseApi } from '@texas-holdem/database-api';
import { Game } from './game';
import { Player } from './player';

export class GameManager {
  private static instance: GameManager;

  private games: Game[] = []; // Good for < 1000 games

  private initialized: boolean = false;

  private constructor() {
    // Initialize any other necessary properties
  }

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

    const databaseApi = DatabaseApi.getInstance();

    const games = await databaseApi.game.findActiveGames();

    // TODO for later: figure out how to initialize game with active round ongoing.
    this.games = games.map((game) => new Game({
      ...game,
      players: game.players.map((player) => new Player({
        id: player.id,
        userId: player.userId,
        stack: player.stack,
      })),
      blinds: game.blinds.sort((a, b) => a.sequence - b.sequence),
    }));

    this.initialized = true;
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

export const gm = GameManager.getInstance();
