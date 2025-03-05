import type { Card as ICard, CardSuit } from '@texas-holdem/shared-types';

type CardProps = {
  card: ICard;
}

export const Card = ({ card }: CardProps) => (
  <div className="w-6 h-9 bg-white rounded-sm shadow-sm flex items-center justify-center text-xs font-bold relative overflow-hidden">
    <div className={`absolute inset-0.5 rounded-[1px] ${getCardColor(card.suit)}`}>
      <div className="absolute top-0.5 left-0.5 text-[6px] font-bold">{card.rank}</div>
      <div className="absolute bottom-0.5 right-0.5 text-[6px] font-bold transform rotate-180">{card.rank}</div>
      <div className="absolute inset-0 flex items-center justify-center text-[8px]">{getSuitSymbol(card.suit)}</div>
    </div>
  </div>
);

function getCardColor(suit: CardSuit) {
  return ['Heart', 'Diamond'].includes(suit) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-700';
}

function getSuitSymbol(suit: CardSuit) {
  switch (suit) {
    case 'Heart':
      return '♥';
    case 'Diamond':
      return '♦';
    case 'Club':
      return '♣';
    case 'Spade':
      return '♠';
    default:
      throw new Error(`Invalid suit: ${suit}`);
  }
}
