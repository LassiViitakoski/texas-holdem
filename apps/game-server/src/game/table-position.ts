import { db } from '@texas-holdem/database-api';
import { playerRegistry } from '../services/player-registry';

export type TablePositionProps = {
  id: number;
  position: number;
  isActive?: boolean;
  isDealer?: boolean;
  gameId: number;
  playerId?: number | null;
};

export class TablePosition {
  public readonly id: number;

  public readonly position: number;

  public isActive: boolean;

  public isDealer: boolean;

  public readonly gameId: number;

  public playerId?: number | null;

  constructor(params: TablePositionProps) {
    this.id = params.id;
    this.position = params.position;
    this.isActive = params.isActive || false;
    this.isDealer = params.isDealer || false;
    this.gameId = params.gameId;
    this.playerId = params.playerId;
  }

  public toJSON() {
    return {
      id: this.id,
      position: this.position,
      isActive: this.isActive,
      isDealer: this.isDealer,
      gameId: this.gameId,
      playerId: this.playerId || null,
      userId: this.playerId ? playerRegistry.getEntityId({
        fromId: this.playerId,
        from: 'player',
        to: 'user',
      }) : null,
    };
  }

  public async removeDealer() {
    await db.tablePosition.update(this.id, { isDealer: false });
    this.isDealer = false;
  }

  public async setAsDealer() {
    await db.tablePosition.update(this.id, { isDealer: true });
    this.isDealer = true;
    return this;
  }

  public activatePosition(playerId: number) {
    this.playerId = playerId;
    this.isActive = true;
  }

  public isPositionAvailable() {
    return !this.isActive && !this.playerId;
  }

  public isPositionActive() {
    return this.isActive && !!this.playerId;
  }
}
