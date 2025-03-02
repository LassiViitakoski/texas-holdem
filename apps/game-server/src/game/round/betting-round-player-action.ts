import { Decimal } from 'decimal.js';
import type { BettingRoundPlayerActionType } from '@texas-holdem/shared-types';

interface BettingRoundPlayerActionProps {
  id: number;
  type: BettingRoundPlayerActionType;
  sequence: number;
  amount: Decimal;
  bettingRoundPlayerId: number;
}

export class BettingRoundPlayerAction {
  public id: number;

  public type: BettingRoundPlayerActionType;

  public sequence: number;

  public amount: Decimal;

  public bettingRoundPlayerId: number;

  constructor(params: BettingRoundPlayerActionProps) {
    this.id = params.id;
    this.type = params.type;
    this.sequence = params.sequence;
    this.amount = params.amount;
    this.bettingRoundPlayerId = params.bettingRoundPlayerId;
  }
}
