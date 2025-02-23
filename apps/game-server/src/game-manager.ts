import { DatabaseApi } from '@texas-holdem/database-api';
import { Game } from './game';

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

    this.games = games.map((game) => {
      const activeRound = game.rounds.find((round) => !round.isFinished);

      return new Game({
        id: game.id,
        blinds: game.blinds
          .sort((a, b) => a.blindNumber - b.blindNumber)
          .map((blind) => blind.amount.toNumber()),
        maxPlayers: game.maximumPlayers,
        minPlayers: game.minimumPlayers,
        chipUnit: game.chipUnit,
        rake: game.rake.toNumber(),
        players: game.players.map((player) => ({
          id: player.id,
          userId: player.userId,
          stack: player.stack.toNumber(),
        })),
        activeRound: activeRound ? {
          id: activeRound?.id,
          pot: activeRound?.pot.toNumber(),
          isFinished: activeRound?.isFinished,
          players: activeRound.roundPlayers.map((roundPlayer) => ({
            id: roundPlayer.id,
            initialStack: roundPlayer.initialStack.toNumber(),
            playerId: roundPlayer.playerId,
          })),
          bettingRounds: activeRound.bettingRounds.map((bettingRound) => ({
            id: bettingRound.id,
            type: bettingRound.type,
            isFinished: bettingRound.isFinished,
            actions: bettingRound.players
              .flatMap((player) => player.actions)
              .sort((a, b) => a.sequence - b.sequence)
              .map((action) => ({
                id: action.id,
                type: action.type,
                amount: action.amount.toNumber(),
                sequence: action.sequence,
              })),
          })),
        } : undefined,

      });
    });
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
