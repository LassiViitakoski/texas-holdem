import type { CardSuit, CardRank, IDeck } from '@texas-holdem/shared-types';

import { Card } from './card';

export class Deck implements IDeck {
  public cards: Card[];

  private static readonly ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '9', '10', 'J', 'Q', 'K', 'A'];

  private static readonly suits: CardSuit[] = ['Club', 'Diamond', 'Heart', 'Spade'];

  constructor() {
    this.cards = [];
  }

  initialize() {
    this.cards = Deck.ranks.flatMap((rank) => Deck.suits.map((suit) => new Card({ rank, suit })));
  }

  /**
   * @description Shuffles the deck with the Fisher-Yates algorithm
   */
  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }

    return this;
  }

  public draw() {
    const card = this.cards.pop();

    if (!card) {
      throw new Error('Deck is empty');
    }

    return card;
  }
}
