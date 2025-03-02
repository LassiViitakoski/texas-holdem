import type { BettingRoundType } from '@texas-holdem/shared-types';
import { BettingRoundPlayer } from './betting-round-player';

interface BettingRoundProps {
  id: number;
  type: BettingRoundType;
  isFinished: boolean;
  players: BettingRoundPlayer[];
}

export class BettingRound {
  public id: number;

  public type: BettingRoundType;

  public isFinished: boolean;

  public players: Map<number, BettingRoundPlayer>;

  constructor(params: BettingRoundProps) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = new Map(params.players.map((player) => [player.id, player]));
  }
}
