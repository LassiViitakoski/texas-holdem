import type { Decimal } from 'decimal.js';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type RoundPhase = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export type PokerAction = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardSuit = 'Club' | 'Diamond' | 'Heart' | 'Spade';

export type CardSuitCode = 'c' | 'd' | 'h' | 's';

export type CardNotation = `${CardRank}${CardSuitCode}` | 'N/A';

export type Card = {
  rank: CardRank;
  suit: CardSuit;
};

export type Blind<T extends number | Decimal> = {
  id: number;
  position: number;
  amount: T;
};
