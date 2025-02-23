import type {
  BettingRoundPlayer,
  BettingRoundType as BettingRoundTypeEnum,
  BettingRound as BettingRoundType,
} from '@texas-holdem/shared-types';

type BettingRoundConstructorParams = BettingRoundType;

export class BettingRound implements BettingRoundType {
  public id: number;

  public type: BettingRoundTypeEnum;

  public isFinished: boolean;

  public players: BettingRoundPlayer[];

  constructor(params: BettingRoundConstructorParams) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = params.players;
  }
}
