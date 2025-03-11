import type { CardSuit, CardRank, CardNotation } from '@texas-holdem/shared-types';
import { Card } from './card';

type BuildTuple<
  T extends number,
  S extends boolean = false,
  R extends Array<S extends true ? CardNotation : Card> = [],
> = R['length'] extends T
  ? R
  : BuildTuple<T, S, [...R, S extends true ? CardNotation : Card]>;

type CardDrawResult<T extends number, S extends boolean = false> = BuildTuple<T, S>;

export class Deck {
  public cards: Card[];

  private static readonly ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '9', '10', 'J', 'Q', 'K', 'A'];

  private static readonly suits: CardSuit[] = ['Club', 'Diamond', 'Heart', 'Spade'];

  constructor() {
    this.cards = [];
    this.initialize();
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

  public draw<T extends number = 1, S extends boolean = false>(
    count: T = 1 as T,
    stringify: S = false as S,
  ): CardDrawResult<T, S> {
    const cards = Array.from({ length: count }, () => {
      const card = this.cards.pop();

      if (!card) {
        throw new Error('Deck is empty');
      }

      return stringify ? card.toString() : card;
    });

    return cards as CardDrawResult<T, S>;
  }
}

/*

import type { CardSuit, CardRank } from '@texas-holdem/shared-types';
import { Card } from './card';

type BuildTuple<T extends number, R extends Array<Card> = []> = R['length'] extends T
  ? R
  : BuildTuple<T, [...R, Card]>;

type CardDrawResult<T extends number> = BuildTuple<T>;

export class Deck {
  public cards: Card[];

  private static readonly ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '9', '10', 'J', 'Q', 'K', 'A'];

  private static readonly suits: CardSuit[] = ['Club', 'Diamond', 'Heart', 'Spade'];

  constructor() {
    this.cards = [];
    this.initialize();
  }

  initialize() {
    this.cards = Deck.ranks.flatMap((rank) => Deck.suits.map((suit) => new Card({ rank, suit })));
  }
  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }

    return this;
  }

  public draw<T extends number = 1>(count: T = 1 as T): CardDrawResult<T> {
    return Array.from({ length: count }, () => {
      const card = this.cards.pop();

      if (!card) {
        throw new Error('Deck is empty');
      }

      return card;
    }) as CardDrawResult<T>;
  }
}

*/
