import type { Decimal } from 'decimal.js';

export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type BettingRoundType = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type BettingRoundPlayerActionType = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'Spade';

export type Blind<T extends number | Decimal> = {
  id: number;
  sequence: number;
  amount: T;
};

export type IGame = {
  id: number;
  blinds: Blind<Decimal>[];
  maximumPlayers: number;
  minimumPlayers: number;
  chipUnit: ChipUnit;
  rake: Decimal;
  players: IPlayer[];
  activeRound?: IRound;
};

export type IRound<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  pot: Decimal;
  isFinished: boolean;
  bettingRounds: IBettingRound[];
  players: IRoundPlayer<Persisted>[];
};

export type IBettingRound = {
  id: number;
  type: BettingRoundType;
  isFinished: boolean;
  players: IBettingRoundPlayer[];
};

export type IPlayer = {
  id: number;
  userId: number;
  stack: Decimal;
};

export type IRoundPlayer<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  stack: Decimal;
  sequence: number;
  playerId: number;
  cards: string[];
};

export type IBettingRoundPlayer = {
  id: number;
  stack: Decimal;
  sequence: number;
  roundPlayerId: number;
  actions: IBettingRoundPlayerAction[];
};

export type IBettingRoundPlayerAction<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  type: BettingRoundPlayerActionType;
  sequence: number;
  amount: Decimal;
  bettingRoundPlayerId: Persisted extends "PERSISTED" ? number : number | undefined;
};

