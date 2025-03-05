import { Card } from '../shared';
import { Card as ICard } from '@texas-holdem/shared-types'

export const CommunityCards = ({ cards }: { cards: Card[] }) => {
  // const cards: PlayingCardType[] = [{ suit: 'heart', value: '7' }, { suit: 'club', value: 'J' }, { suit: 'diamond', value: 'Q' }, { suit: 'spade', value: '2' }, { suit: 'diamond', value: '9' }];

  return (
    <div className="flex space-x-1">
      {cards.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
};
