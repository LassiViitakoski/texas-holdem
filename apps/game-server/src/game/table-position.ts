import { db } from '@texas-holdem/database-api';

export type TablePositionProps = {
  id: number;
  position: number;
  isActive?: boolean;
  isDealer?: boolean;
  gameId: number;
  playerId?: number | null;
};

export class TablePosition {
  private readonly id: number;

  public readonly position: number;

  public isActive: boolean;

  public isDealer: boolean;

  public readonly gameId: number;

  public readonly playerId?: number | null;

  constructor(params: TablePositionProps) {
    this.id = params.id;
    this.position = params.position;
    this.isActive = params.isActive || false;
    this.isDealer = params.isDealer || false;
    this.gameId = params.gameId;
    this.playerId = params.playerId;
  }

  public async removeDealer() {
    await db.tablePosition.update(this.id, { isDealer: false });
    this.isDealer = false;
  }

  public async setAsDealer() {
    await db.tablePosition.update(this.id, { isDealer: true });
    this.isDealer = true;
  }
}
