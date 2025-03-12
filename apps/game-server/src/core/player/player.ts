import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import { playerRegistry } from '../../services';

interface PlayerProps {
  id: number;
  userId: number;
  username: string;
  stack: Decimal;
}

export class Player {
  public id: number;

  public username: string;

  public stack: Decimal;

  constructor(params: PlayerProps) {
    this.id = params.id;
    this.username = params.username;
    this.stack = params.stack;
    playerRegistry.registerPlayer(this.id, params.userId);
  }

  toJSON() {
    return {
      id: this.id,
      userId: playerRegistry.getEntityId({
        fromId: this.id,
        from: 'player',
        to: 'user',
      }),
      username: this.username,
      stack: this.stack.toNumber(),
    };
  }

  async deductFromStack(amount: Decimal) {
    this.stack = (await db.player.update(this.id, {
      stack: this.stack.minus(amount),
    })).stack;
    return this.stack;
  }
}
