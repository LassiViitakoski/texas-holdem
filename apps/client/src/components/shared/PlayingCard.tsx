import { CardSuit, PlayingCardType } from '@/types';

type PlayingCardProps = {
  card: PlayingCardType;
}

export const PlayingCard = ({ card }: PlayingCardProps) => (
  <div className="w-6 h-9 bg-white rounded-sm shadow-sm flex items-center justify-center text-xs font-bold relative overflow-hidden">
    <div className={`absolute inset-0.5 rounded-[1px] ${getCardColor(card.suit)}`}>
      <div className="absolute top-0.5 left-0.5 text-[6px] font-bold">{card.value}</div>
      <div className="absolute bottom-0.5 right-0.5 text-[6px] font-bold transform rotate-180">{card.value}</div>
      <div className="absolute inset-0 flex items-center justify-center text-[8px]">{getSuitSymbol(card.suit)}</div>
    </div>
  </div>
);

function getCardColor(suit: CardSuit) {
  return ['heart', 'diamond'].includes(suit) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-700';
}

function getSuitSymbol(suit: CardSuit) {
  switch (suit) {
    case 'heart':
      return '♥';
    case 'diamond':
      return '♦';
    case 'club':
      return '♣';
    case 'spade':
      return '♠';
    default:
      throw new Error(`Invalid suit: ${suit}`);
  }
}
