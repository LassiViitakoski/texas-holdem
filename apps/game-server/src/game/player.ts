import { Decimal } from 'decimal.js';

interface PlayerProps {
  id: number;
  userId: number;
  username: string;
  stack: Decimal;
}

export class Player {
  public id: number;

  public userId: number;

  public username: string;

  public stack: Decimal;

  constructor(params: PlayerProps) {
    this.id = params.id;
    this.userId = params.userId;
    this.username = params.username;
    this.stack = params.stack;
  }
}
