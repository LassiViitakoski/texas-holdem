import type { CardRank, BuildTuple } from '@texas-holdem/shared-types';
import { Card } from '../../models';

export type ShowdownHand = BuildTuple<Card, 5>;

export type CombinedCards = BuildTuple<Card, 7>;

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

export class PokerHandEvaluator {
  private combinations: ShowdownHand[] = [];

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

  public initializeCombinations(cards: CombinedCards) {
    this.combinations = PokerHandEvaluator.createHandCombinations(cards);
    return this;
  }

  public findBestHand() {
    let bestHand = { cards: [] as unknown as ShowdownHand, rank: -1 };

    for (let i = 0; i < this.combinations.length; i += 1) {
      const currentHand = this.combinations[i];
      const currentRank = PokerHandEvaluator.evaluateHand(currentHand);

      if (currentRank > bestHand.rank) {
        bestHand = { cards: currentHand, rank: currentRank };
      }
    }

    return bestHand;
  }

  public static evaluateHand(hand: ShowdownHand): number {
    // Sort the hand by rank for easier evaluation

    // Check for flush (all same suit)
    const isFlush = PokerHandEvaluator.isFlush(hand);

    // Check for straight (sequential ranks)
    const isStraight = PokerHandEvaluator.isStraight(hand);

    // Get rank counts for pairs, three of a kind, etc.
    const rankCounts = PokerHandEvaluator.getRankCounts(hand);
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
  private static isFlush(hand: ShowdownHand): boolean {
    const { suit } = hand[0];

    for (let i = 1; i < hand.length; i += 1) {
      if (hand[i].suit !== suit) {
        return false;
      }
    }

    return true;
  }

  private static getNumericRank(card: Card) {
    return +(PokerHandEvaluator.ALPHABETICAL_CARD_RANKS.get(card.rank) || card.rank);
  }

  private static isStraight(hand: ShowdownHand) {
    // Check for Ace-low straight (A,2,3,4,5)
    if (hand[0].rank === '2' && hand[4].rank === 'A') {
      return hand.slice(0, 4).every((card, index) => PokerHandEvaluator.getNumericRank(card) === index + 2);
    }

    return hand.every((rank, index) => index === 0
      || PokerHandEvaluator.getNumericRank(rank) === PokerHandEvaluator.getNumericRank(hand[index - 1]) + 1);
  }

  private static getRankCounts(hand: ShowdownHand) {
    const map = new Map<CardRank, number>();

    for (let i = 0; i < hand.length; i += 1) {
      const card = hand[i];
      const count = map.get(card.rank) || 0;
      map.set(card.rank, count + 1);
    }

    return map;
  }

  private static createHandCombinations(cards: BuildTuple<Card, 7>) {
    return PokerHandEvaluator.COMBINATIONS_7C5
      .map((indices) => indices.map((i) => cards[i])) as ShowdownHand[];
  }

  private static compareCardRanks = (a: Card, b: Card) => {
    const rankA = PokerHandEvaluator.getNumericRank(a);
    const rankB = PokerHandEvaluator.getNumericRank(b);
    return rankA - rankB;
  };

  private static getHighCardValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const skippedHandsCount = 0;

    return hand
      .reduce((acc, card, index) => {
        if (rankCounts.get(card.rank) === 1) {
          acc.total += (
            PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[index - skippedHandsCount]
          * PokerHandEvaluator.getNumericRank(card)
          );
        } else {
          acc.skippedHands += 1;
        }

        return acc;
      }, { total: 0, skippedHands: 0 })
      .total;
  }

  private static getOnePairValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const oneOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 2);

    if (!oneOfAKindCard) {
      return 0;
    }

    const numericRank = PokerHandEvaluator.getNumericRank(oneOfAKindCard);
    return numericRank * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4]
      + PokerHandEvaluator.getHighCardValue(hand, rankCounts);
  }

  private static getTwoPairValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const twoOfAKindRanks = Array.from(rankCounts.entries())
      .filter(([, count]) => count === 2)
      .map(([rank]) => rank);

    if (twoOfAKindRanks.length !== 2) {
      return 0;
    }

    const twoOfAKindCards = twoOfAKindRanks.map((rank) => hand.find((card) => card.rank === rank)!);

    const numericTwoOfAKindRanks = twoOfAKindCards.map((card) => PokerHandEvaluator.getNumericRank(card));

    // Make sure the higher pair is first
    if (numericTwoOfAKindRanks[0] < numericTwoOfAKindRanks[1]) {
      [numericTwoOfAKindRanks[0], numericTwoOfAKindRanks[1]] = [numericTwoOfAKindRanks[1], numericTwoOfAKindRanks[0]];
    }

    return numericTwoOfAKindRanks[0] * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4]
      + numericTwoOfAKindRanks[1] * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[3]
      + PokerHandEvaluator.getHighCardValue(hand, rankCounts);
  }

  private static getFourOfAKindValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const fourOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 4);

    if (!fourOfAKindCard) {
      return 0;
    }

    const numericRank = PokerHandEvaluator.getNumericRank(fourOfAKindCard);
    return numericRank * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4];
  }

  private static getFullHouseValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const threeOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 3);

    if (!threeOfAKindCard) {
      return 0;
    }

    const twoOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 2);

    if (!twoOfAKindCard) {
      return 0;
    }

    const numericThreeOfAKindRank = PokerHandEvaluator.getNumericRank(threeOfAKindCard);
    const numericTwoOfAKindRank = PokerHandEvaluator.getNumericRank(twoOfAKindCard);

    return numericThreeOfAKindRank * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[1]
      + numericTwoOfAKindRank * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[0];
  }

  private static getThreeOfAKindValue(hand: ShowdownHand, rankCounts: Map<CardRank, number>): number {
    const threeOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 3);

    if (!threeOfAKindCard) {
      return 0;
    }

    const numericRank = PokerHandEvaluator.getNumericRank(threeOfAKindCard);
    return numericRank * PokerHandEvaluator.HIGH_CARD_RANK_MULTIPLIERS[4]
      + PokerHandEvaluator.getHighCardValue(hand, rankCounts);
  }
}
