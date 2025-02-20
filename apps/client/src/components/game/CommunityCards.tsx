import { PlayingCard } from '../shared';
import { PlayingCardType } from '@/types';

export const CommunityCards = () => {
  const cards: PlayingCardType[] = [{ suit: 'heart', value: '7' }, { suit: 'club', value: 'J' }, { suit: 'diamond', value: 'Q' }, { suit: 'spade', value: '2' }, { suit: 'diamond', value: '9' }];

  return (
    <div className="flex space-x-1">
      {cards.map((card, index) => (
        <PlayingCard key={index} card={card} />
      ))}
    </div>
  );
};
