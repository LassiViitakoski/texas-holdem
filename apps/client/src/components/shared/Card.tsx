import type { CardNotation, CardRank, CardSuitCode } from '@texas-holdem/shared-types';

type CardProps = {
  card: CardNotation;
}



export const Card = ({ card }: CardProps) => {
  const rank = card.slice(0, -1) as CardRank;
  const suitCode = card.slice(-1) as CardSuitCode;
  const isHidden = card === 'N/A';

  return (
    <div className="w-6 h-9 bg-white rounded-sm shadow-sm flex items-center justify-center text-xs font-bold relative overflow-hidden">
      {isHidden ? (
        // Card back design
        <div className="absolute inset-0.5 bg-blue-600 rounded-[1px]">
          <div className="absolute inset-1 border-2 border-blue-400 rounded-[1px]" />
          <div className="absolute inset-2 bg-blue-500 rounded-[1px] flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
          </div>
        </div>
      ) : (
        // Card front (existing design)
        <div className={`absolute inset-0.5 rounded-[1px] ${getCardColor(suitCode)}`}>
          <div className="absolute top-0.5 left-0.5 text-[6px] font-bold">{rank}</div>
          <div className="absolute bottom-0.5 right-0.5 text-[6px] font-bold transform rotate-180">{rank}</div>
          <div className="absolute inset-0 flex items-center justify-center text-[8px]">{getSuitSymbol(suitCode)}</div>
        </div>
      )}
    </div>
  )
};

function getCardColor(suit: CardSuitCode) {
  return ['h', 'd'].includes(suit) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-700';
}

function getSuitSymbol(suit: CardSuitCode) {
  switch (suit) {
    case 'h':
      return '♥';
    case 'd':
      return '♦';
    case 'c':
      return '♣';
    case 's':
      return '♠';
    default:
      throw new Error(`Invalid suit: ${suit}`);
  }
}
