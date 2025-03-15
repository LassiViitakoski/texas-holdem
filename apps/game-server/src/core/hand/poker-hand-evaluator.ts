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

  // Pre-calculate powers of 15 for 5-card hand
  private static readonly HIGH_CARD_RANK_MULTIPLIERS = [
    1, // 15^0 = 1
    15, // 15^1 = 15
    15 * 15, // 15^2 = 225
    15 * 15 * 15, // 15^3 = 3375
    15 * 15 * 15 * 15, // 15^4 = 50625
  ] as const;

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
      return HandRank.ROYAL_FLUSH; // Royal Flush
    }
    if (isFlush && isStraight) {
      return HandRank.STRAIGHT_FLUSH + PokerHandEvaluator.getHighCardValue(hand, rankCounts); // Straight Flush
    }
    if (counts.includes(4)) {
      return HandRank.FOUR_OF_KIND + PokerHandEvaluator.getFourOfAKindValue(hand, rankCounts); // Four of a Kind
    }
    if (counts.includes(3) && counts.includes(2)) {
      return HandRank.FULL_HOUSE + PokerHandEvaluator.getFullHouseValue(hand, rankCounts); // Full House
    }
    if (isFlush) {
      return HandRank.FLUSH + PokerHandEvaluator.getHighCardValue(hand, rankCounts); // Flush
    }
    if (isStraight) {
      return HandRank.STRAIGHT + PokerHandEvaluator.getHighCardValue(hand, rankCounts); // Straight
    }
    if (counts.includes(3)) {
      return HandRank.THREE_OF_KIND + PokerHandEvaluator.getThreeOfAKindValue(hand, rankCounts); // Three of a Kind
    }
    if (counts.filter((count) => count === 2).length === 2) {
      return HandRank.TWO_PAIR + PokerHandEvaluator.getTwoPairValue(hand, rankCounts); // Two Pair
    }
    if (counts.includes(2)) {
      return HandRank.ONE_PAIR + PokerHandEvaluator.getOnePairValue(hand, rankCounts); // One Pair
    }

    return PokerHandEvaluator.getHighCardValue(hand, rankCounts); // High Card
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

  private getRankCounts(hand: Card[]): Map<CardRank, number> {
    const map = new Map<CardRank, number>();

    for (let i = 0; i < hand.length; i += 1) {
      const card = hand[i];
      const count = map.get(card.rank) || 0;
      map.set(card.rank, count + 1);
    }

    return map;
  }

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

  private static getHighCardValue(hand: Card[], rankCounts: Map<CardRank, number>): number {
    let skippedHandsCount = 0;

    return hand.reduce((total, card, index) => {
      if (rankCounts.get(card.rank) === 1) {
        return total + (
          PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[index - skippedHandsCount]
          * +(
            PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(card.rank) || card.rank
          )
        );
      }

      skippedHandsCount += 1;
      return total;
    }, 0);
  }

  private static getFourOfAKindValue(hand: Card[], rankCounts: Map<CardRank, number>): number {
    const fourOfAKindRank = Array.from(rankCounts.entries())
      .find(([, count]) => count === 4)?.[0];

    if (!fourOfAKindRank) {
      return 0;
    }

    return +(
      PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(fourOfAKindRank) || fourOfAKindRank
    ) * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4];
  }

  private static getFullHouseValue(hand: Card[], rankCounts: Map<CardRank, number>): number {
    const threeOfAKindRank = hand.find((card) => rankCounts.get(card.rank) === 3)?.rank;

    if (!threeOfAKindRank) {
      return 0;
    }

    const twoOfAKindRank = hand.find((card) => rankCounts.get(card.rank) === 2)?.rank;

    if (!twoOfAKindRank) {
      return 0;
    }

    return +(PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(threeOfAKindRank) || threeOfAKindRank) * 1000
      + +(PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(twoOfAKindRank) || twoOfAKindRank);
  }

  private static getThreeOfAKindValue(hand: Card[], rankCounts: Map<CardRank, number>): number {
    const threeOfAKindRank = Array.from(rankCounts.entries())
      .find(([, count]) => count === 3)?.[0];

    if (!threeOfAKindRank) {
      return 0;
    }

    return +(
      PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(threeOfAKindRank) || threeOfAKindRank
    ) * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4]
      + PokerHandEvaluator.getHighCardValue(hand, rankCounts);
  }
}
