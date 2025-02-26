import { Decimal } from 'decimal.js';
import type { IBettingRoundPlayerAction, BettingRoundPlayerActionType } from '@texas-holdem/shared-types';

export class BettingRoundPlayerAction implements IBettingRoundPlayerAction {
  public id: number;

  public type: BettingRoundPlayerActionType;

  public sequence: number;

  public amount: Decimal;

  public bettingRoundPlayerId: number;

  constructor(params: IBettingRoundPlayerAction) {
    this.id = params.id;
    this.type = params.type;
    this.sequence = params.sequence;
    this.amount = params.amount;
    this.bettingRoundPlayerId = params.bettingRoundPlayerId;
  }
}
