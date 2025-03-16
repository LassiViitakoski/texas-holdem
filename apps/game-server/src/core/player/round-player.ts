import { Decimal } from 'decimal.js';
import { db } from '@texas-holdem/database-api';
import { Card } from '../../models';
import { playerRegistry } from '../../services';

interface RoundPlayerProps {
  id: number;
  position: number;
  initialStack: Decimal;
  isWinner: boolean;
  winnings: Decimal;
  playerId: number;
  cards?: Card[];
}

export class RoundPlayer {
  public id: number;

  public position: number;

  public initialStack: Decimal;

  public isWinner: boolean;

  public winnings: Decimal;

  public cards: Card[];

  constructor(params: RoundPlayerProps) {
    this.id = params.id;
    this.position = params.position;
    this.initialStack = params.initialStack;
    this.isWinner = params.isWinner;
    this.winnings = params.winnings;
    this.cards = params.cards || [];
    playerRegistry.registerRoundPlayer(this.id, params.playerId);
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      initialStack: this.initialStack.toNumber(),
      cards: this.cards,
      userId: playerRegistry.getEntityId({
        fromId: this.id,
        from: 'roundPlayer',
        to: 'user',
      }),
    };
  }

  public async markAsWinner(winnings: Decimal) {
    const updatedPlayer = await db.roundPlayer.update(this.id, {
      winnings,
      isWinner: true,
    });
    this.isWinner = updatedPlayer.isWinner;
    this.winnings = updatedPlayer.winnings;
  }
}
