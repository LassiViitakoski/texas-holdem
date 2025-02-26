import type {
  IBettingRound,
  BettingRoundType,
} from '@texas-holdem/shared-types';
import { BettingRoundPlayer } from './betting-round-player';

export class BettingRound implements IBettingRound {
  public id: number;

  public type: BettingRoundType;

  public isFinished: boolean;

  public players: BettingRoundPlayer[];

  constructor(params: IBettingRound) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = params.players;
  }
}
