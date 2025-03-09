import { Chip, DealerButton, Card } from '@/components/shared';
import { Card as ICard } from '@texas-holdem/shared-types'
import { TablePosition as ITablePosition } from '@/stores/gameStore';
import { socketService } from '@/services/socket';
import { useGameState } from '@/contexts/GameContext';
import { useLocalStorageUser } from '@/hooks/useUsers';
type TablePositionProps = {
  tablePosition: ITablePosition
  player?: {
    username: string
    stack: number
    cards?: ICard[]
  }
}

export const TablePosition = ({ tablePosition, player }: TablePositionProps) => {
  const game = useGameState(state => state);
  const user = useLocalStorageUser();

  const angle = (tablePosition.position * 60 - 90) * (Math.PI / 180);
  const radius = 44; // Percentage of container's width
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  const onJoinGame = () => {
    socketService.joinGame({
      gameId: tablePosition.gameId,
      buyIn: 100, // TODO {game.buyIn},
      userId: user.id,
      positionId: tablePosition.id,
    })
  }

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      {tablePosition.isActive ? (
        <div className="w-32 bg-black/40 backdrop-blur-sm border-blue-400/20">
          <div className="flex flex-col items-center p-2 relative">
            <div className="h-12 w-12 border border-blue-400/50">
              {player && (
                <img src={`https://api.dicebear.com/6.x/personas/svg?seed=${player?.username || 'N/A'}`} alt={player?.username || 'N/A'} />
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-white">{player?.username || 'N/A'}</p>
            <Chip amount={player?.stack || 0} className="mt-1" />
            {player?.cards && (
              <div className="flex space-x-0.5">
                {player.cards.map((card, index) => <Card key={index} card={card} />)}
              </div>
            )}
            {tablePosition.isDealer && <DealerButton className="absolute -top-1 -right-1" />}
          </div>
        </div>
      )
        : (
          <button
            type="button"
            onClick={() => onJoinGame()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Join
          </button>
        )}
    </div>
  );
};
