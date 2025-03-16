import { Card } from '../../../models';
import {
  evaluateHand, findBestHand, HandRank, createHandCombinations,
} from './hand-evaluation';
import type { ShowdownHand, CombinedCards } from './hand-evaluation';

describe('Hand Evaluation', () => {
  describe('evaluateHand', () => {
    it('should identify High Card', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '2', suit: 'Heart' }),
        new Card({ rank: '4', suit: 'Diamond' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: '10', suit: 'Spade' }),
        new Card({ rank: 'A', suit: 'Heart' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('High Card');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.HIGH_CARD);
      expect(result.rank).toBeLessThan(HandRank.ONE_PAIR);
      expect(result.rank).toBe(708750 + 33750 + 1800 + 60 + 2);
    });

    it('should correctly rank similar high card hands with different middle card', () => {
      const hand1: ShowdownHand = [
        new Card({ rank: '2', suit: 'Heart' }),
        new Card({ rank: '4', suit: 'Diamond' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: '10', suit: 'Spade' }),
        new Card({ rank: 'A', suit: 'Heart' }),
      ] as ShowdownHand;

      const hand2: ShowdownHand = [
        new Card({ rank: '2', suit: 'Club' }),
        new Card({ rank: '4', suit: 'Heart' }),
        new Card({ rank: '9', suit: 'Diamond' }), // Only difference: 9 instead of 8
        new Card({ rank: '10', suit: 'Club' }),
        new Card({ rank: 'A', suit: 'Spade' }),
      ] as ShowdownHand;

      const result1 = evaluateHand(hand1);
      const result2 = evaluateHand(hand2);

      expect(result1.name).toBe('High Card');
      expect(result2.name).toBe('High Card');
      expect(result2.rank).toBeGreaterThan(result1.rank);
    });

    it('should correctly rank similar high card hands with different lowest card', () => {
      const hand1: ShowdownHand = [
        new Card({ rank: '2', suit: 'Heart' }),
        new Card({ rank: '4', suit: 'Diamond' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: '10', suit: 'Spade' }),
        new Card({ rank: 'A', suit: 'Heart' }),
      ] as ShowdownHand;

      const hand2: ShowdownHand = [
        new Card({ rank: '3', suit: 'Club' }), // Only difference: 3 instead of 2
        new Card({ rank: '4', suit: 'Heart' }),
        new Card({ rank: '8', suit: 'Diamond' }),
        new Card({ rank: '10', suit: 'Club' }),
        new Card({ rank: 'A', suit: 'Spade' }),
      ] as ShowdownHand;

      const result1 = evaluateHand(hand1);
      const result2 = evaluateHand(hand2);

      expect(result1.name).toBe('High Card');
      expect(result2.name).toBe('High Card');
      expect(result2.rank).toBeGreaterThan(result1.rank);
    });

    it('should identify One Pair', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '2', suit: 'Heart' }),
        new Card({ rank: '4', suit: 'Spade' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: 'Q', suit: 'Diamond' }),
        new Card({ rank: 'Q', suit: 'Heart' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('One Pair');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.ONE_PAIR);
      expect(result.rank).toBeLessThan(HandRank.TWO_PAIR);
    });

    it('should identify Two Pair', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '4', suit: 'Heart' }),
        new Card({ rank: '4', suit: 'Diamond' }),
        new Card({ rank: '9', suit: 'Club' }),
        new Card({ rank: '9', suit: 'Spade' }),
        new Card({ rank: 'J', suit: 'Heart' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Two Pair');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.TWO_PAIR);
      expect(result.rank).toBeLessThan(HandRank.THREE_OF_KIND);
    });

    it('should identify Three of a Kind', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '2', suit: 'Heart' }),
        new Card({ rank: '8', suit: 'Heart' }),
        new Card({ rank: '8', suit: 'Diamond' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: 'K', suit: 'Spade' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Three of a Kind');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.THREE_OF_KIND);
      expect(result.rank).toBeLessThan(HandRank.STRAIGHT);
    });

    it('should identify Straight', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '7', suit: 'Heart' }),
        new Card({ rank: '8', suit: 'Diamond' }),
        new Card({ rank: '9', suit: 'Club' }),
        new Card({ rank: '10', suit: 'Spade' }),
        new Card({ rank: 'J', suit: 'Heart' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Straight');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.STRAIGHT);
      expect(result.rank).toBeLessThan(HandRank.FLUSH);
    });

    it('should identify Flush', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '2', suit: 'Spade' }),
        new Card({ rank: '5', suit: 'Spade' }),
        new Card({ rank: '7', suit: 'Spade' }),
        new Card({ rank: '9', suit: 'Spade' }),
        new Card({ rank: 'J', suit: 'Spade' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Flush');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.FLUSH);
      expect(result.rank).toBeLessThan(HandRank.FULL_HOUSE);
    });

    it('should identify Full House', () => {
      const hand: ShowdownHand = [
        new Card({ rank: 'Q', suit: 'Spade' }),
        new Card({ rank: 'Q', suit: 'Heart' }),
        new Card({ rank: 'K', suit: 'Heart' }),
        new Card({ rank: 'K', suit: 'Diamond' }),
        new Card({ rank: 'K', suit: 'Club' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Full House');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.FULL_HOUSE);
      expect(result.rank).toBeLessThan(HandRank.FOUR_OF_KIND);
    });

    it('should identify Four of a Kind', () => {
      const hand: ShowdownHand = [
        new Card({ rank: 'K', suit: 'Heart' }),
        new Card({ rank: 'A', suit: 'Heart' }),
        new Card({ rank: 'A', suit: 'Diamond' }),
        new Card({ rank: 'A', suit: 'Club' }),
        new Card({ rank: 'A', suit: 'Spade' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Four of a Kind');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.FOUR_OF_KIND);
      expect(result.rank).toBeLessThan(HandRank.STRAIGHT_FLUSH);
    });

    it('should identify Straight Flush', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '5', suit: 'Club' }),
        new Card({ rank: '6', suit: 'Club' }),
        new Card({ rank: '7', suit: 'Club' }),
        new Card({ rank: '8', suit: 'Club' }),
        new Card({ rank: '9', suit: 'Club' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Straight Flush');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.STRAIGHT_FLUSH);
      expect(result.rank).toBeLessThan(HandRank.ROYAL_FLUSH);
    });

    it('should identify Royal Flush', () => {
      const hand: ShowdownHand = [
        new Card({ rank: '10', suit: 'Heart' }),
        new Card({ rank: 'J', suit: 'Heart' }),
        new Card({ rank: 'Q', suit: 'Heart' }),
        new Card({ rank: 'K', suit: 'Heart' }),
        new Card({ rank: 'A', suit: 'Heart' }),
      ] as ShowdownHand;

      const result = evaluateHand(hand);
      expect(result.name).toBe('Royal Flush');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.ROYAL_FLUSH);
    });
  });

  describe('findBestHand', () => {
    it('should find the best hand from seven cards', () => {
      const sevenCards: CombinedCards = [
        new Card({ rank: '2', suit: 'Diamond' }),
        new Card({ rank: '3', suit: 'Club' }),
        new Card({ rank: '10', suit: 'Heart' }),
        new Card({ rank: 'J', suit: 'Heart' }),
        new Card({ rank: 'Q', suit: 'Heart' }),
        new Card({ rank: 'K', suit: 'Heart' }),
        new Card({ rank: 'A', suit: 'Heart' }),
      ] as CombinedCards;

      const result = findBestHand(sevenCards);
      expect(result.name).toBe('Royal Flush');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.ROYAL_FLUSH);
    });

    it('should handle multiple possible hands and select the best one', () => {
      const sevenCards: CombinedCards = [
        new Card({ rank: '2', suit: 'Diamond' }),
        new Card({ rank: '3', suit: 'Club' }),
        new Card({ rank: 'K', suit: 'Heart' }),
        new Card({ rank: 'K', suit: 'Diamond' }),
        new Card({ rank: 'A', suit: 'Heart' }),
        new Card({ rank: 'A', suit: 'Diamond' }),
        new Card({ rank: 'A', suit: 'Club' }),
      ] as CombinedCards;

      const result = findBestHand(sevenCards);
      expect(result.name).toBe('Full House');
      expect(result.rank).toBeGreaterThanOrEqual(HandRank.FULL_HOUSE);
      expect(result.rank).toBeLessThan(HandRank.FOUR_OF_KIND);
    });
  });

  describe('createHandCombinations', () => {
    it('should generate all possible 5-card combinations from 7 cards', () => {
      const sevenCards: CombinedCards = [
        new Card({ rank: '2', suit: 'Diamond' }),
        new Card({ rank: '3', suit: 'Club' }),
        new Card({ rank: '4', suit: 'Heart' }),
        new Card({ rank: '5', suit: 'Spade' }),
        new Card({ rank: '6', suit: 'Heart' }),
        new Card({ rank: '7', suit: 'Diamond' }),
        new Card({ rank: '8', suit: 'Club' }),
      ] as CombinedCards;

      const combinations = createHandCombinations(sevenCards);

      // There should be exactly 21 combinations (7C5 = 21)
      expect(combinations).toHaveLength(21);

      // Each combination should have exactly 5 cards
      combinations.forEach((hand) => {
        expect(hand).toHaveLength(5);
      });

      // Verify some specific combinations exist
      const hasFirstFiveCards = combinations.some((hand) => hand.every((card, index) => card === sevenCards[index]));
      expect(hasFirstFiveCards).toBe(true);

      const hasLastFiveCards = combinations.some((hand) => hand.every((card, index) => card === sevenCards[index + 2]));
      expect(hasLastFiveCards).toBe(true);

      // Verify all cards are from the original set
      combinations.forEach((hand) => {
        hand.forEach((card) => {
          expect(sevenCards).toContain(card);
        });
      });

      // Verify combinations are unique
      const uniqueCombinations = new Set(
        combinations.map((hand) => hand.map((card) => `${card.rank}${card.suit}`).join(',')),
      );
      expect(uniqueCombinations.size).toBe(21);
    });
  });
});
