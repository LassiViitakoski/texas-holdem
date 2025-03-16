import type { CardRank, BuildTuple } from '@texas-holdem/shared-types';
import { Card } from '../../models';

export type ShowdownHand = BuildTuple<Card, 5>;
export type CombinedCards = BuildTuple<Card, 7>;

// Constants
const COMBINATIONS_7C5 = [
  [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6],
  [0, 1, 2, 4, 5], [0, 1, 2, 4, 6], [0, 1, 2, 5, 6],
  [0, 1, 3, 4, 5], [0, 1, 3, 4, 6], [0, 1, 3, 5, 6],
  [0, 1, 4, 5, 6], [0, 2, 3, 4, 5], [0, 2, 3, 4, 6],
  [0, 2, 3, 5, 6], [0, 2, 4, 5, 6], [0, 3, 4, 5, 6],
  [1, 2, 3, 4, 5], [1, 2, 3, 4, 6], [1, 2, 3, 5, 6],
  [1, 2, 4, 5, 6], [1, 3, 4, 5, 6], [2, 3, 4, 5, 6],
] as const;

const ALPHABETICAL_CARD_RANKS = new Map<CardRank, string>([
  ['J', '11'],
  ['Q', '12'],
  ['K', '13'],
  ['A', '14'],
]);

const HIGH_CARD_RANK_MULTIPLIERS = [
  1, // 15^0 = 1
  15, // 15^1 = 15
  15 * 15, // 15^2 = 225
  15 * 15 * 15, // 15^3 = 3375
  15 * 15 * 15 * 15, // 15^4 = 50625
] as const;

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

// Helper functions
const getNumericRank = (card: Card): number => +(ALPHABETICAL_CARD_RANKS.get(card.rank) || card.rank);

const isFlush = (hand: ShowdownHand): boolean => {
  const { suit } = hand[0];
  return hand.every((card) => card.suit === suit);
};

const isStraight = (hand: ShowdownHand): boolean => {
  const numericRanks = hand.map((card) => getNumericRank(card));

  // Check for Ace-low straight (A,2,3,4,5)
  if (numericRanks[0] === 2 && numericRanks[4] === 14) {
    return numericRanks.slice(0, 4).every((rank, index) => rank === index + 2);
  }

  // Check for regular straight
  return numericRanks.every((rank, index) => index === 0 || rank === numericRanks[index - 1] + 1);
};

const getRankCounts = (hand: ShowdownHand): Map<CardRank, number> => hand.reduce((counts, card) => {
  counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  return counts;
}, new Map<CardRank, number>());

const createHandCombinations = (cards: CombinedCards): ShowdownHand[] => (
  COMBINATIONS_7C5.map((indices) => indices.map((i) => cards[i])) as ShowdownHand[]
);

const getHighCardValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>) => hand
  .reduce((acc, card, index) => {
    if (rankCounts.get(card.rank) === 1) {
      acc.total += HIGH_CARD_RANK_MULTIPLIERS[index - acc.skippedHands] * getNumericRank(card);
    } else {
      acc.skippedHands += 1;
    }

    return acc;
  }, { total: 0, skippedHands: 0 })
  .total;

const getOnePairValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>): number => {
  const oneOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 2);
  if (!oneOfAKindCard) return 0;

  return getNumericRank(oneOfAKindCard) * HIGH_CARD_RANK_MULTIPLIERS[4]
    + getHighCardValue(hand, rankCounts);
};

const getTwoPairValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>): number => {
  const pairs = Array.from(rankCounts.entries())
    .filter(([, count]) => count === 2)
    .map(([rank]) => hand.find((card) => card.rank === rank)!)
    .sort((a, b) => getNumericRank(b) - getNumericRank(a));

  if (pairs.length !== 2) {
    throw new Error('Two pair requires two pairs');
  }

  const [highPair, lowPair] = pairs;
  return getNumericRank(highPair) * HIGH_CARD_RANK_MULTIPLIERS[4]
    + getNumericRank(lowPair) * HIGH_CARD_RANK_MULTIPLIERS[3]
    + getHighCardValue(hand, rankCounts);
};

const getFourOfAKindValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>): number => {
  const fourOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 4);

  if (!fourOfAKindCard) {
    throw new Error('Four of a kind requires four of a kind');
  }

  return getNumericRank(fourOfAKindCard) * HIGH_CARD_RANK_MULTIPLIERS[4];
};

const getFullHouseValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>): number => {
  const threeOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 3);
  const twoOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 2);

  if (!threeOfAKindCard || !twoOfAKindCard) {
    throw new Error('Full house requires three of a kind and two of a kind');
  }

  return getNumericRank(threeOfAKindCard) * HIGH_CARD_RANK_MULTIPLIERS[1]
    + getNumericRank(twoOfAKindCard) * HIGH_CARD_RANK_MULTIPLIERS[0];
};

const getThreeOfAKindValue = (hand: ShowdownHand, rankCounts: Map<CardRank, number>): number => {
  const threeOfAKindCard = hand.find((card) => rankCounts.get(card.rank) === 3);

  if (!threeOfAKindCard) {
    throw new Error('Three of a kind requires three of a kind');
  }

  return getNumericRank(threeOfAKindCard) * HIGH_CARD_RANK_MULTIPLIERS[4] + getHighCardValue(hand, rankCounts);
};

// Core evaluation functions
export const evaluateHand = (hand: ShowdownHand): number => {
  const isFlushHand = isFlush(hand);
  const isStraightHand = isStraight(hand);
  const rankCounts = getRankCounts(hand);
  const counts = Array.from(rankCounts.values());

  if (isFlushHand && isStraightHand && hand[4].rank === 'A') {
    return HandRank.ROYAL_FLUSH;
  }

  if (isFlushHand && isStraightHand) {
    return HandRank.STRAIGHT_FLUSH + getHighCardValue(hand, rankCounts);
  }

  if (counts.includes(4)) {
    return HandRank.FOUR_OF_KIND + getFourOfAKindValue(hand, rankCounts);
  }

  if (counts.includes(3) && counts.includes(2)) {
    return HandRank.FULL_HOUSE + getFullHouseValue(hand, rankCounts);
  }

  if (isFlushHand) {
    return HandRank.FLUSH + getHighCardValue(hand, rankCounts);
  }

  if (isStraightHand) {
    return HandRank.STRAIGHT + getHighCardValue(hand, rankCounts);
  }

  if (counts.includes(3)) {
    return HandRank.THREE_OF_KIND + getThreeOfAKindValue(hand, rankCounts);
  }

  if (counts.filter((count) => count === 2).length === 2) {
    return HandRank.TWO_PAIR + getTwoPairValue(hand, rankCounts);
  }

  if (counts.includes(2)) {
    return HandRank.ONE_PAIR + getOnePairValue(hand, rankCounts);
  }

  return getHighCardValue(hand, rankCounts);
};

export const findBestHand = (cards: CombinedCards) => {
  const sortedCards = [...cards].sort((a, b) => getNumericRank(a) - getNumericRank(b)) as CombinedCards;
  const combinations = createHandCombinations(sortedCards);

  return combinations.reduce<{ cards: ShowdownHand; rank: number }>(
    (best, currentHand) => {
      const currentRank = evaluateHand(currentHand);
      return currentRank > best.rank
        ? { cards: currentHand, rank: currentRank }
        : best;
    },
    { cards: combinations[0], rank: -1 },
  );
};
