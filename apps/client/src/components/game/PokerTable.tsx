import { TablePosition } from '@/components/game/TablePosition';
import { Chip } from '@/components/shared';
import { CommunityCards } from './CommunityCards';
import { useGameState } from '@/contexts/GameContext';

export const PokerTable = () => {
  const tablePositions = useGameState(state => state.tablePositions);
  const game = useGameState(state => state);
  const activeRound = useGameState(state => state.activeRound);
  const winners = Array.from(activeRound?.players?.values() || [])
    .filter(p => p.isWinner)
    .map(player => ({
      ...player,
      username: game.players.get(player.userId)?.username || '',
    }));


  return (
    <div className="flex relative items-center justify-center min-h-[600px] p-4">
      {winners.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="text-black text-2xl font-bold">
            Winners: {winners.map(w => `${w.username} ($${w.winnings})`).join(',')}
          </div>
        </div>
      )}
      <div className="relative w-full max-w-4xl aspect-[16/9]">
        <div className="absolute inset-0 bg-emerald-800 rounded-[35%] shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-[url('/felt-texture.png')] opacity-20 mix-blend-multiply" />
          <div className="absolute inset-2 border-2 border-blue-400/30 rounded-[35%]" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/5 to-black/20" />
        </div>
        {activeRound && (
          <div className="absolute inset-[15%] flex items-center justify-center -translate-y-6">
            <Chip amount={activeRound.pot} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center translate-y-6">
          <CommunityCards cards={activeRound?.communityCards || []} />
        </div>
        {tablePositions.map((tablePosition) => {
          return (
            <TablePosition
              key={tablePosition.id}
              tablePosition={tablePosition}
            />
          )
        })}
      </div>
    </div>
  );
};
