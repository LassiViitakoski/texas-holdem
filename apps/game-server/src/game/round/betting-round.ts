import type { RoundPhase } from '@texas-holdem/shared-types';
import { BettingRoundPlayer } from '../player/betting-round-player';
import { BettingRoundAction } from './betting-round-action';

interface BettingRoundProps {
  id: number;
  type: RoundPhase;
  isFinished: boolean;
  players: BettingRoundPlayer[];
  actions: BettingRoundAction[];
}

export class BettingRound {
  public id: number;

  public type: RoundPhase;

  public isFinished: boolean;

  public players: Map<number, BettingRoundPlayer>;

  public actions: BettingRoundAction[];

  constructor(params: BettingRoundProps) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = new Map(params.players.map((player) => [player.id, player]));
    this.actions = params.actions;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      isFinished: this.isFinished,
      players: Array.from(this.players.values()),
      actions: this.actions,
    };
  }
}
