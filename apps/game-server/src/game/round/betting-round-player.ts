import { Decimal } from 'decimal.js';
import { BettingRoundPlayerAction } from './betting-round-player-action';

interface BettingRoundPlayerProps {
  id: number;
  stack: Decimal;
  position: number;
  roundPlayerId: number;
  hasActed?: boolean;
  hasFolded?: boolean;
  actions: BettingRoundPlayerAction[];
}

export class BettingRoundPlayer {
  public id: number;

  public stack: Decimal;

  public position: number;

  public roundPlayerId: number;

  public hasActed: boolean;

  public hasFolded: boolean;

  public actions: BettingRoundPlayerAction[];

  constructor(params: BettingRoundPlayerProps) {
    this.id = params.id;
    this.stack = params.stack;
    this.position = params.position;
    this.roundPlayerId = params.roundPlayerId;
    this.actions = params.actions;
    this.hasActed = params.hasActed || false;
    this.hasFolded = params.hasFolded || false;
  }
}
