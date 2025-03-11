import type {
  CardRank, CardSuit, CardSuitCode, CardNotation,
} from '@texas-holdem/shared-types';

export class Card {
  public rank: CardRank;

  public suit: CardSuit;

  constructor({ rank, suit }: { rank: CardRank; suit: CardSuit }) {
    this.rank = rank;
    this.suit = suit;
  }

  public toJSON() {
    return this.toString();
  }

  public toString(): CardNotation {
    return `${this.rank}${Card.suitToCodeMap[this.suit]}`;
  }

  private static readonly suitToCodeMap: Record<CardSuit, CardSuitCode> = {
    Club: 'c',
    Diamond: 'd',
    Heart: 'h',
    Spade: 's',
  };

  private static readonly codeToSuitMap: Record<CardSuitCode, CardSuit> = {
    c: 'Club',
    d: 'Diamond',
    h: 'Heart',
    s: 'Spade',
  };

  public static fromString(card: CardNotation) {
    const rank = card.slice(0, -1) as CardRank;
    const suitCode = card.slice(-1) as CardSuitCode;
    return new Card({ rank, suit: Card.codeToSuitMap[suitCode] });
  }
}
