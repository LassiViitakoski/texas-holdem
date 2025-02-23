import { ChipUnit, GameStatus } from '@texas-holdem/shared-types';

export type CreateGamePayload = {
  maxPlayers: number;
  blinds: number[];
  buyIn: number;
};

export type Blind = {
  id: number;
  blindNumber: number;
  amount: number;
};

export type Game = {
  id: number;
  minimumPlayers: number;
  maximumPlayers: number;
  chipUnit: ChipUnit;
  rake: number;
  status: GameStatus;
  createdAt: string;
  updatedAt: string;
  blinds: Blind[];
};
