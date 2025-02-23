import type {
  Round as RoundType,
  RoundPlayer,
} from '@texas-holdem/shared-types';
import Decimal from 'decimal.js';
import { BettingRound } from './betting-round';

type RoundConstructorParams = RoundType;

export class Round implements RoundType {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public bettingRounds: BettingRound[];

  public players: RoundPlayer[];

  constructor(params: RoundConstructorParams) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.bettingRounds = params.bettingRounds;
    this.players = params.players;
  }
}
