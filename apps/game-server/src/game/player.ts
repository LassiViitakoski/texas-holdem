import { Decimal } from 'decimal.js';
import type { IPlayer } from '@texas-holdem/shared-types';

export class Player implements IPlayer {
  public id: number;

  public userId: number;

  public stack: Decimal;

  constructor(params: IPlayer) {
    this.id = params.id;
    this.userId = params.userId;
    this.stack = params.stack;
  }
}
