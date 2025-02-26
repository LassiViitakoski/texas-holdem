import { Decimal } from 'decimal.js';
import type { IBettingRoundPlayer } from '@texas-holdem/shared-types';
import { BettingRoundPlayerAction } from './betting-round-player-action';

export class BettingRoundPlayer implements IBettingRoundPlayer {
  public id: number;

  public stack: Decimal;

  public sequence: number;

  public roundPlayerId: number;

  public actions: BettingRoundPlayerAction[];

  constructor(params: IBettingRoundPlayer) {
    this.id = params.id;
    this.stack = params.stack;
    this.sequence = params.sequence;
    this.roundPlayerId = params.roundPlayerId;
    this.actions = params.actions;
  }
}
