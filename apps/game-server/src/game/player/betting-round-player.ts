import { playerRegistry } from '../../services';

interface BettingRoundPlayerProps {
  id: number;
  position: number;
  hasActed?: boolean;
  hasFolded?: boolean;
  roundPlayerId: number;
}

export class BettingRoundPlayer {
  public id: number;

  public position: number;

  public hasActed: boolean;

  public hasFolded: boolean;

  constructor(params: BettingRoundPlayerProps) {
    this.id = params.id;
    this.position = params.position;
    this.hasActed = params.hasActed || false;
    this.hasFolded = params.hasFolded || false;
    playerRegistry.registerBettingRoundPlayer(this.id, params.roundPlayerId);
  }

  toJSON() {
    return {
      id: this.id,
      position: this.position,
      hasActed: this.hasActed,
      hasFolded: this.hasFolded,
      userId: playerRegistry.getEntityId({
        fromId: this.id,
        from: 'bettingRoundPlayer',
        to: 'user',
      }),
    };
  }
}
