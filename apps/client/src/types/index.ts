export type CardSuit = 'heart' | 'diamond' | 'club' | 'spade';
export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface PlayingCardType {
  suit: CardSuit;
  value: CardValue;
}

export interface Hand {
  cards: PlayingCardType[];
}

export interface Player {
  name: string;
  chips: number;
  cards?: PlayingCardType[];
}
