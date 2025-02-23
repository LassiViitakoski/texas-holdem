import { DatabaseApi } from '@texas-holdem/database-api';
import type {
  Game as GameType,
  ChipUnit,
  GameStatus,
  Player,
  Round,
} from '@texas-holdem/shared-types';

type GameConstructorParams = GameType;

export class Game {
  public id: number;

  public blinds: number[];

  public maxPlayers: number;

  public minPlayers: number;

  public chipUnit: ChipUnit;

  public rake: number;

  public status?: GameStatus;

  public players: Player[];

  public activeRound?: Round;

  constructor(params: GameConstructorParams) {
    this.id = params.id;
    this.blinds = params.blinds;
    this.maxPlayers = params.maxPlayers;
    this.minPlayers = params.minPlayers;
    this.chipUnit = params.chipUnit;
    this.rake = params.rake;
    this.status = params.status;
    this.players = params.players;
    this.activeRound = params.activeRound;
  }

  public async startNewRound() {
    const db = DatabaseApi.getInstance();
    const response = await db.round.create({
      gameId: this.id,
      players: this.players.map((player, index) => ({
        id: player.id,
        blind: this.blinds[index] || 0,
        stack: player.stack,
        cards: index === 0 ? [12, 13] : [38, 39],
      })),
    });

    console.log(JSON.stringify(response, null, 2));
    return response;
  }
}
