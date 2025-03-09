import { Decimal } from 'decimal.js';
import { Card } from '../../models';
import { playerRegistry } from '../../services';

interface RoundPlayerProps {
  id: number;
  position: number;
  initialStack: Decimal;
  playerId: number;
  cards?: Card[];
}

export class RoundPlayer {
  public id: number;

  public position: number;

  public initialStack: Decimal;

  public cards: Card[];

  constructor(params: RoundPlayerProps) {
    this.id = params.id;
    this.position = params.position;
    this.initialStack = params.initialStack;
    this.cards = params.cards || [];
    playerRegistry.registerRoundPlayer(this.id, params.playerId);
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      initialStack: this.initialStack.toNumber(),
      userId: playerRegistry.getEntityId({
        fromId: this.id,
        from: 'roundPlayer',
        to: 'user',
      }),
    };
  }
}
