import type { Player as PlayerType } from '@texas-holdem/shared-types';
import Decimal from 'decimal.js';

type PlayerConstructorParams = PlayerType;

export class Player {
  public id: number;

  public userId: number;

  public stack: Decimal;

  constructor(params: PlayerConstructorParams) {
    this.id = params.id;
    this.userId = params.userId;
    this.stack = params.stack;
  }
}
