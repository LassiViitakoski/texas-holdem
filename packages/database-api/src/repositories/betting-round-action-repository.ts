import { PokerAction, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type CreateBettingRoundActionData = {
  bettingRoundId: number;
  type: PokerAction;
  amount: number | Decimal;
  sequence: number;
  bettingRoundPlayerId: number;
};

export class BettingRoundActionRepository {
  constructor(private readonly client: PrismaClient) {}

  public async create(data: CreateBettingRoundActionData) {
    return this.client.bettingRoundAction.create({
      data,
    });
  }

  public async createMany(data: CreateBettingRoundActionData[]) {
    return this.client.bettingRoundAction.createManyAndReturn({
      data,
    });
  }
}
