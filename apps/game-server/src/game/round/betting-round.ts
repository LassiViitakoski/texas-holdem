import type { RoundPhase } from '@texas-holdem/shared-types';
import { BettingRoundPlayer } from '../player';
import { BettingRoundAction } from './betting-round-action';
import { playerRegistry } from '../../services';

interface BettingRoundProps {
  id: number;
  type: RoundPhase;
  isFinished: boolean;
  players: BettingRoundPlayer[];
  actions: BettingRoundAction[];
  activeBettingRoundPlayerId: number;
}

export class BettingRound {
  public id: number;

  public type: RoundPhase;

  public isFinished: boolean;

  public players: BettingRoundPlayer[];

  public actions: BettingRoundAction[];

  public activeBettingRoundPlayerId: number;

  constructor(params: BettingRoundProps) {
    this.id = params.id;
    this.type = params.type;
    this.isFinished = params.isFinished;
    this.players = params.players;
    this.actions = params.actions;
    this.activeBettingRoundPlayerId = params.activeBettingRoundPlayerId;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      isFinished: this.isFinished,
      players: this.players,
      actions: this.actions,
      activeUserId: playerRegistry.getEntityId({
        fromId: this.activeBettingRoundPlayerId,
        from: 'bettingRoundPlayer',
        to: 'user',
      }),
    };
  }
}
