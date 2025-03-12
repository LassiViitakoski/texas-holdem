import { Decimal } from 'decimal.js';
import type { PokerAction } from '@texas-holdem/shared-types';
import { db } from '@texas-holdem/database-api';
import { playerRegistry } from '../../services';

interface BettingRoundActionParams {
  id: number;
  type: PokerAction;
  sequence: number;
  amount: Decimal;
  bettingRoundPlayerId: number;
}

type CreationParams = Omit<BettingRoundActionParams, 'id'> & { bettingRoundId: number };

export class BettingRoundAction {
  public id: number;

  public type: PokerAction;

  public sequence: number;

  public amount: Decimal;

  public readonly bettingRoundPlayerId: number;

  constructor(params: BettingRoundActionParams) {
    this.id = params.id;
    this.type = params.type;
    this.sequence = params.sequence;
    this.amount = params.amount;
    this.bettingRoundPlayerId = params.bettingRoundPlayerId;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      sequence: this.sequence,
      amount: this.amount.toNumber(),
      userId: playerRegistry.getEntityId({
        fromId: this.bettingRoundPlayerId,
        from: 'bettingRoundPlayer',
        to: 'user',
      }),
    };
  }

  public static async createNormalizedPlayerActions(data: [CreationParams, CreationParams | undefined]) {
    const creationData = await db.bettingRoundAction.createMany(
      data.filter((action) => !!action),
    );

    return creationData.map((action) => new BettingRoundAction(action));
  }
}
