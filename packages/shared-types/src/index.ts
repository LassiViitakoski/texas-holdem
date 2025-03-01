import type { Decimal } from 'decimal.js';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type BettingRoundType = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type BettingRoundPlayerActionType = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'Spade';

export type ICard = {
  rank: CardRank;
  suit: CardSuit;
};

export type IDeck = {
  cards: ICard[];
};

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
  tablePositions: ITablePosition[];
};

export type ITablePosition = {
  id: number;
  position: number;
  isActive: boolean;
  isDealer: boolean;
  playerId: number;
}

export type IRound<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  pot: Decimal;
  isFinished: boolean;
  bettingRounds: IBettingRound[];
  players: IRoundPlayer<Persisted>[];
  deck: IDeck;
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
  username: string;
  stack: Decimal;
};

export type IRoundPlayer<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  stack: Decimal;
  playerId: number;
  cards: ICard[];
};

export type IBettingRoundPlayer = {
  id: number;
  stack: Decimal;
  sequence: number;
  roundPlayerId: number;
  actions: IBettingRoundPlayerAction[];

  // Computed properties
  hasActed: boolean;
  hasFolded: boolean;
};

export type IBettingRoundPlayerAction<Persisted extends "PERSISTED" | "UNPERSISTED" = "PERSISTED"> = {
  id: Persisted extends "PERSISTED" ? number : number | undefined;
  type: BettingRoundPlayerActionType;
  sequence: number;
  amount: Decimal;
  bettingRoundPlayerId: Persisted extends "PERSISTED" ? number : number | undefined;
};

