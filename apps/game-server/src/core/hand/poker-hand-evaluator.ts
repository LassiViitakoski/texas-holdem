import { CardRank } from '@texas-holdem/shared-types';
import { Card } from '../../models';

// Define clear types
enum HandRank {
  HIGH_CARD = 0,
  ONE_PAIR = 1000000,
  TWO_PAIR = 2000000,
  THREE_OF_KIND = 3000000,
  STRAIGHT = 4000000,
  FLUSH = 5000000,
  FULL_HOUSE = 6000000,
  FOUR_OF_KIND = 7000000,
  STRAIGHT_FLUSH = 8000000,
  ROYAL_FLUSH = 9000000,
}

class PokerHandEvaluator {
  private combinations: Card[][] = [];

  // Pre-computed indices for all possible 5-card combinations from 7 cards
  private static readonly COMBINATIONS_7C5 = [
    [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6],
    [0, 1, 2, 4, 5], [0, 1, 2, 4, 6], [0, 1, 2, 5, 6],
    [0, 1, 3, 4, 5], [0, 1, 3, 4, 6], [0, 1, 3, 5, 6],
    [0, 1, 4, 5, 6], [0, 2, 3, 4, 5], [0, 2, 3, 4, 6],
    [0, 2, 3, 5, 6], [0, 2, 4, 5, 6], [0, 3, 4, 5, 6],
    [1, 2, 3, 4, 5], [1, 2, 3, 4, 6], [1, 2, 3, 5, 6],
    [1, 2, 4, 5, 6], [1, 3, 4, 5, 6], [2, 3, 4, 5, 6],
  ] as const;

  private static readonly ALPHABETICAL_CARD_RANKS = new Map<CardRank, string>([
    ['J', '11'],
    ['Q', '12'],
    ['K', '13'],
    ['A', '14'],
  ]);

  private static createHandCombinations(cards: Card[]) {
    if (cards.length !== 7) {
      throw new Error('Cannot create combinations from non-7 cards');
    }

    return PokerHandEvaluator.COMBINATIONS_7C5.map((indices) => indices.map((i) => cards[i]));
  }

  private static compareCardRanks = (a: Card, b: Card) => {
    const rankA = this.ALPHABETICAL_CARD_RANKS.get(a.rank) || a.rank;
    const rankB = this.ALPHABETICAL_CARD_RANKS.get(b.rank) || b.rank;
    return Number(rankA) - Number(rankB);
  };

  public initializeCombinations(cards: Card[]) {
    if (cards.length !== 7) {
      throw new Error('Cannot create combinations from non-7 cards');
    }

    this.combinations = PokerHandEvaluator.createHandCombinations(
      cards.toSorted(PokerHandEvaluator.compareCardRanks),
    );
    return this;
  }

  public findBestHand() {
    let bestHand = { cards: [] as Card[], rank: -1 };

    for (let i = 0; i < this.combinations.length; i += 1) {
      const currentHand = this.combinations[i];
      const currentRank = this.evaluateHand(currentHand);

      if (currentRank > bestHand.rank) {
        bestHand = { cards: currentHand, rank: currentRank };
      }
    }

    return bestHand;
  }

  public evaluateHand(hand: Card[]): number {
    if (hand.length !== 5) {
      throw new Error('Cannot evaluate hand with non-5 cards');
    }

    // Sort the hand by rank for easier evaluation

    // Check for flush (all same suit)
    const isFlush = this.isFlush(hand);

    // Check for straight (sequential ranks)
    const isStraight = this.isStraight(hand);

    // Get rank counts for pairs, three of a kind, etc.
    const rankCounts = this.getRankCounts(hand);
    const counts = Array.from(rankCounts.values());

    // Hand rankings (multiply by 1000000 to ensure proper ordering)
    if (isFlush && isStraight && hand[4].rank === 'A') {
      return 9000000; // Royal Flush
    }
    if (isFlush && isStraight) {
      return 8000000 + this.getHighCardValue(hand); // Straight Flush
    }
    if (counts.includes(4)) {
      return 7000000 + this.getFourOfAKindValue(hand, rankCounts); // Four of a Kind
    }
    if (counts.includes(3) && counts.includes(2)) {
      return 6000000 + this.getFullHouseValue(hand, rankCounts); // Full House
    }
    if (isFlush) {
      return 5000000 + this.getHighCardValue(hand); // Flush
    }
    if (isStraight) {
      return 4000000 + this.getHighCardValue(hand); // Straight
    }
    if (counts.includes(3)) {
      return 3000000 + this.getThreeOfAKindValue(hand, rankCounts); // Three of a Kind
    }
    if (counts.filter((count) => count === 2).length === 2) {
      return 2000000 + this.getTwoPairValue(hand, rankCounts); // Two Pair
    }
    if (counts.includes(2)) {
      return 1000000 + this.getOnePairValue(hand, rankCounts); // One Pair
    }

    return this.getHighCardValue(hand); // High Card
  }

  // Helper methods to implement:
  private isFlush(hand: Card[]): boolean {
    const { suit } = hand[0];

    for (let i = 1; i < hand.length; i += 1) {
      if (hand[i].suit !== suit) {
        return false;
      }
    }

    return true;
  }

  private isStraight(hand: Card[]): boolean {
    // Check if cards form a sequential range
    // Don't forget to handle Ace-low straight (A,2,3,4,5)
  }

  private getRankCounts(hand: Card[]): Map<string, number> {
    const map = new Map<string, number>();

    for (let i = 0; i < hand.length; i += 1) {
      const card = hand[i];
      const count = map.get(card.rank) || 0;
      map.set(card.rank, count + 1);
    }

    return map;
  }

  private getHighCardValue(hand: Card[]): number {
    // Calculate value based on all card ranks
  }

  private getFourOfAKindValue(hand: Card[], rankCounts: Map<string, number>): number {
    // Calculate value for four of a kind
  }

  // Implement similar methods for other hand type values
}

const cards = [
  new Card({ rank: 'A', suit: 'Club' }),
  new Card({ rank: 'K', suit: 'Club' }),
  new Card({ rank: 'Q', suit: 'Club' }),
  new Card({ rank: 'J', suit: 'Club' }),
  new Card({ rank: '10', suit: 'Club' }),
  new Card({ rank: '9', suit: 'Club' }),
];

const evaluator = new PokerHandEvaluator().initializeCombinations(cards);
const bestHand = evaluator.findBestHand();
