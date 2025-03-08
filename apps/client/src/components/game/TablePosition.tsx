import { Chip, DealerButton, Card } from '@/components/shared';
import { Card as ICard } from '@texas-holdem/shared-types'

type TablePositionProps = {
  position: number
  player?: {
    name: string
    stack: number
    cards?: ICard[]
  }
  isDealer: boolean
}

export const TablePosition = ({ position, player, isDealer }: TablePositionProps) => {
  const angle = (position * 60 - 90) * (Math.PI / 180);
  const radius = 44; // Percentage of container's width
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      <div className="w-32 bg-black/40 backdrop-blur-sm border-blue-400/20">
        <div className="flex flex-col items-center p-2 relative">
          <div className="h-12 w-12 border border-blue-400/50">
            <img src={`https://api.dicebear.com/6.x/personas/svg?seed=${player?.name || 'N/A'}`} alt={player?.name || 'N/A'} />
          </div>
          <p className="mt-1 text-xs font-medium text-white">{player?.name || 'N/A'}</p>
          <Chip amount={player?.stack || 0} className="mt-1" />
          {player?.cards && (
            <div className="flex space-x-0.5">
              {player.cards.map((card, index) => <Card key={index} card={card} />)}
            </div>
          )}
          {isDealer && <DealerButton className="absolute -top-1 -right-1" />}
        </div>
      </div>
    </div>
  );
};
