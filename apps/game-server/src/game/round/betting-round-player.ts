import { Decimal } from 'decimal.js';
import type { IBettingRoundPlayer, Optional } from '@texas-holdem/shared-types';
import { BettingRoundPlayerAction } from './betting-round-player-action';

export class BettingRoundPlayer implements IBettingRoundPlayer {
  public id: number;

  public stack: Decimal;

  public sequence: number;

  public roundPlayerId: number;

  public hasActed: boolean;

  public hasFolded: boolean;

  public actions: BettingRoundPlayerAction[];

  constructor(params: Optional<IBettingRoundPlayer, 'hasActed' | 'hasFolded'>) {
    this.id = params.id;
    this.stack = params.stack;
    this.sequence = params.sequence;
    this.roundPlayerId = params.roundPlayerId;
    this.actions = params.actions;
    this.hasActed = params.hasActed || false;
    this.hasFolded = params.hasFolded || false;
  }
}
