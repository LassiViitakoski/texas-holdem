export type GameStatus = 'WAITING' | 'ROUND_IN_PROGRESS' | 'INACTIVE';

export type ChipUnit = 'CHIP' | 'CASH';

export type BettingRoundType = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export type BettingRoundActionType = 'BLIND' | 'CALL' | 'CHECK' | 'FOLD' | 'RAISE';

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

export type Player = {
  id: number;
  userId: number;
  stack: number;
};

export type Game = {
  id: number;
  blinds: number[];
  maxPlayers: number;
  minPlayers: number;
  chipUnit: ChipUnit;
  rake: number;
  players: Player[];
  status?: GameStatus;
  activeRound?: Round;
};

export type Round = {
  id: number;
  pot: number;
  isFinished: boolean;
  bettingRounds: BettingRound[];
  players: RoundPlayer[];
}

export type RoundPlayer = {
  id: number;
  initialStack: number;
  playerId: number;
}

export type BettingRound = {
  id: number;
  type: BettingRoundType;
  isFinished: boolean;
  players?: Player[]; // TODO
  actions: BettingRoundAction[];
}

export type BettingRoundAction = {
  id: number;
  type: BettingRoundActionType;
  sequence: number;
  amount: number;
  playerId?: number; // TODO
}