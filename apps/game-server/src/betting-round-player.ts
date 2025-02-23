import { Decimal } from 'decimal.js';

import type {
  BettingRoundPlayer as BettingRoundPlayerType,
} from '@texas-holdem/shared-types';
import { BettingRoundPlayerAction } from './betting-round-player-action';

type BettingRoundPlayerConstructorParams = BettingRoundPlayerType;

export class BettingRoundPlayer implements BettingRoundPlayerType {
  public id: number;

  public stack: Decimal;

  public sequence: number;

  public roundPlayerId: number;

  public actions: BettingRoundPlayerAction[];

  constructor(params: BettingRoundPlayerConstructorParams) {
    this.id = params.id;
    this.stack = params.stack;
    this.sequence = params.sequence;
    this.roundPlayerId = params.roundPlayerId;
    this.actions = params.actions;
  }
}
