import type { Decimal } from 'decimal.js';

export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type BettingRoundType = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type BettingRoundPlayerActionType = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

export type CardRank = 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN' | 'NINE' | 'TEN' | 'JACK' | 'QUEEN' | 'KING' | 'ACE';

export type CardSuit = 'CLUB' | 'DIAMOND' | 'HEART' | 'SPADE';

export type CardRankMap = {
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  ACE: [1, 14],
}

export type Blind<T extends number | Decimal> = {
  id: number;
  sequence: number;
  amount: T;
};

export type Game = {
  id: number;
  blinds: Blind<Decimal>[];
  maximumPlayers: number;
  minimumPlayers: number;
  chipUnit: ChipUnit;
  rake: Decimal;
  players: Player[];
  activeRound?: Round;
};

export type Round<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  pot: Decimal;
  isFinished: boolean;
  bettingRounds: BettingRound[];
  players: RoundPlayer<Persisted>[];
};

export type BettingRound = {
  id: number;
  type: BettingRoundType;
  isFinished: boolean;
  players: BettingRoundPlayer[];
};

export type Player = {
  id: number;
  userId: number;
  stack: Decimal;
};

export type RoundPlayer<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  stack: Decimal;
  sequence: number;
  playerId: number;
  cards: string[];
};

export type BettingRoundPlayer = {
  id: number;
  stack: Decimal;
  sequence: number;
  roundPlayerId: number;
  actions: BettingRoundPlayerAction[];
};

export type BettingRoundPlayerAction<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  type: BettingRoundPlayerActionType;
  sequence: number;
  amount: Decimal;
  bettingRoundPlayerId: Persisted extends "PERSISTED" ? number : number | undefined;
};

