import { Player as PlayerType } from '@texas-holdem/shared-types';

type PlayerConstructorParams = PlayerType;

export class Player {
  public id: number;

  public userId: number;

  public chips: number;

  constructor(params: PlayerConstructorParams) {
    this.id = params.id;
    this.userId = params.userId;
    this.chips = params.chips;
  }
}
