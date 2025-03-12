import { Chip, DealerButton, Card } from '@/components/shared';
import { TablePosition as ITablePosition } from '@/stores/gameStore';
import { socketService } from '@/services/socket';
import { useGameState, useGameActions } from '@/contexts/GameContext';
import { useLocalStorageUser } from '@/hooks/useUsers';
import { ActionButtons } from '@/components/game/ActionButtons';
import { ActionTimer } from '@/components/shared/ActionTimer';

type TablePositionProps = {
  tablePosition: ITablePosition
}

export const TablePosition = ({ tablePosition }: TablePositionProps) => {
  const game = useGameState(state => state);
  const actions = useGameActions();
  const user = useLocalStorageUser();

  const player = tablePosition.userId ? game.players.get(tablePosition.userId) : null;
  const roundPlayer = tablePosition.userId ? game.activeRound?.players.get(tablePosition.userId) : null;
  const activeBettingRound = game.activeRound?.activeBettingRound;
  const playerContribution = activeBettingRound?.actions
    ?.reduce((acc, action) => action.userId === tablePosition.userId ? acc + action.amount : acc, 0)
    || 0;

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
            {playerContribution > 0 && (
              <Chip amount={playerContribution} className="bg-amber-500/50" size="small" />
            )}
            {roundPlayer?.cards && (
              <div className="flex space-x-0.5">
                {roundPlayer.cards.map((card, index) => <Card key={index} card={card} />)}
              </div>
            )}
            {activeBettingRound && activeBettingRound.activeUserId === player?.userId && (
              <div className="mt-2 w-full">
                <div className="mb-2">
                  {activeBettingRound.actionTimeout ? (
                    <div className="text-center block text-red-500">Time's up!</div>
                  ) : (
                    <ActionTimer
                      timeToActSeconds={activeBettingRound.timeToActSeconds}
                      onTimeUp={actions.handlePlayerActionTimeout}
                    />
                  )}
                </div>
                {tablePosition.userId === user.id && !activeBettingRound.actionTimeout && (
                  <ActionButtons
                    gameId={tablePosition.gameId}
                    userId={user.id}
                    activeBettingRound={activeBettingRound}
                    playerStack={player?.stack || 0}
                  />
                )}
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
