import { ChipUnit } from '@texas-holdem/shared-types';

export type CreateGamePayload = {
  maximumPlayers: number;
  blinds: number[];
  buyIn: number;
};

export type Blind = {
  id: number;
  sequence: number;
  amount: number;
};

export type Game = {
  id: number;
  minimumPlayers: number;
  maximumPlayers: number;
  chipUnit: ChipUnit;
  rake: number;
  createdAt: string;
  updatedAt: string;
  blinds: Blind[];
};
