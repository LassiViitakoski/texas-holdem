import type { CardRank, CardSuit } from '@texas-holdem/shared-types';

export class Card {
  public rank: CardRank;

  public suit: CardSuit;

  constructor({ rank, suit }: { rank: CardRank; suit: CardSuit }) {
    this.rank = rank;
    this.suit = suit;
  }

  private static readonly suitToCodeMap: Record<CardSuit, string> = {
    Club: 'c',
    Diamond: 'd',
    Heart: 'h',
    Spade: 's',
  };

  private static readonly codeToSuitMap: Record<string, CardSuit> = {
    c: 'Club',
    d: 'Diamond',
    h: 'Heart',
    s: 'Spade',
  };

  public static fromString(card: string) {
    const rank = card.slice(0, -1) as CardRank;
    const suitCode = card.slice(-1) as keyof typeof Card.codeToSuitMap;
    return new Card({ rank, suit: Card.codeToSuitMap[suitCode] });
  }

  public toString() {
    return `${this.rank}${Card.suitToCodeMap[this.suit]}`;
  }
}
