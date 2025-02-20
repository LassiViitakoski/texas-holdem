import { Chip, DealerButton, PlayingCard } from '@/components/shared';
import { PlayingCardType } from '@/types';

type PlayerPositionProps = {
  position: number
  player: {
    name: string
    chips: number
    cards?: PlayingCardType[]
  }
  isDealer: boolean
}

export const PlayerPosition = ({ position, player, isDealer }: PlayerPositionProps) => {
  const angle = (position * 60 - 90) * (Math.PI / 180);
  const radius = 44; // Percentage of container's width
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      <div className="w-32 bg-black/40 backdrop-blur-sm border-blue-400/20">
        <div className="flex flex-col items-center p-2 relative">
          <div className="h-12 w-12 border border-blue-400/50">
            <img src={`https://api.dicebear.com/6.x/personas/svg?seed=${player.name}`} alt={player.name} />
          </div>
          <p className="mt-1 text-xs font-medium text-white">{player.name}</p>
          <Chip amount={player.chips} className="mt-1" />
          {player.cards && (
            <div className="flex space-x-0.5">
              {player.cards.map((card, index) => <PlayingCard key={index} card={card} />)}
            </div>
          )}
          {isDealer && <DealerButton className="absolute -top-1 -right-1" />}
        </div>
      </div>
    </div>
  );
};
