import { Decimal } from 'decimal.js';
import { Card } from '../../models/card';
import { playerRegistry } from '../../services/player-registry';

interface RoundPlayerProps {
  id: number;
  stack: Decimal;
  playerId: number;
  cards?: Card[];
}

export class RoundPlayer {
  public id: number;

  public stack: Decimal;

  public cards: Card[];

  constructor(params: RoundPlayerProps) {
    this.id = params.id;
    this.stack = params.stack;
    this.cards = params.cards || [];
    playerRegistry.registerRoundPlayer(this.id, params.playerId);
  }

  toJSON() {
    return {
      id: this.id,
      stack: this.stack.toNumber(),
      userId: playerRegistry.getEntityId({
        fromId: this.id,
        from: 'roundPlayer',
        to: 'user',
      }),
    };
  }
}
