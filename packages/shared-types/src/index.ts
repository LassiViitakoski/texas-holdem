import type { Decimal } from 'decimal.js';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type BettingRoundType = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type BettingRoundPlayerActionType = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'Spade';

export type Card = {
  rank: CardRank;
  suit: CardSuit;
};

export type Blind<T extends number | Decimal> = {
  id: number;
  position: number;
  amount: T;
};

export type RoundPlayer<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  stack: Decimal;
  playerId: number;
  cards: Card[];
};
