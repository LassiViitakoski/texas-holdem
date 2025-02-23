import type {
  BettingRoundPlayerAction as BettingRoundPlayerActionType,
  BettingRoundPlayerActionType as BettingRoundPlayerActionTypeEnum,
} from '@texas-holdem/shared-types';
import { Decimal } from 'decimal.js';

type BettingRoundPlayerActionConstructorParams = BettingRoundPlayerActionType;

export class BettingRoundPlayerAction {
  public id: number;

  public type: BettingRoundPlayerActionTypeEnum;

  public sequence: number;

  public amount: Decimal;

  public bettingRoundPlayerId: number;

  constructor(params: BettingRoundPlayerActionConstructorParams) {
    this.id = params.id;
    this.type = params.type;
    this.sequence = params.sequence;
    this.amount = params.amount;
    this.bettingRoundPlayerId = params.bettingRoundPlayerId;
  }
}
