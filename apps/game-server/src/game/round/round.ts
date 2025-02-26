import { Decimal } from 'decimal.js';
import type { IRound, IRoundPlayer } from '@texas-holdem/shared-types';
import { BettingRound } from './betting-round';

export class Round implements IRound {
  public id: number;

  public pot: Decimal;

  public isFinished: boolean;

  public bettingRounds: BettingRound[];

  public players: IRoundPlayer[];

  constructor(params: IRound) {
    this.id = params.id;
    this.pot = params.pot;
    this.isFinished = params.isFinished;
    this.bettingRounds = params.bettingRounds;
    this.players = params.players;
  }
}
