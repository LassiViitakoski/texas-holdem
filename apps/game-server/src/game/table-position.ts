export type TablePositionConstructorParams = {
  id: number;
  position: number;
  isActive?: boolean;
  isDealer?: boolean;
  gameId: number;
  playerId?: number;
};

export class TablePosition {
  private readonly id: number;

  private readonly position: number;

  private isActive: boolean;

  private isDealer: boolean;

  private readonly gameId: number;

  private readonly playerId?: number;

  constructor(params: TablePositionConstructorParams) {
    this.id = params.id;
    this.position = params.position;
    this.isActive = params.isActive || false;
    this.isDealer = params.isDealer || false;
    this.gameId = params.gameId;
    this.playerId = params.playerId;
  }
}
