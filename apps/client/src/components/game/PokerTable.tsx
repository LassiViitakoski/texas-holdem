import { TablePosition } from '@/components/game/TablePosition';
import { Chip } from '@/components/shared';
import { CommunityCards } from './CommunityCards';
import { useParams } from '@tanstack/react-router';
import { BetButton } from './BetButton';
import { useGameState, useGameActions } from '@/contexts/GameContext';

export const PokerTable = () => {
  console.log('Poker Table Rendering')
  const { gameId } = useParams({ from: '/games/room/$gameId' });
  const gameIdNumeric = parseInt(gameId, 10);


  /*
  const players: Player[] = [
    { name: 'You', chips: 1000, cards: [{ suit: 'heart', value: 'A' }, { suit: 'spade', value: 'K' }] },
    { name: 'Player 2', chips: 1500 },
    { name: 'Player 3', chips: 800 },
    { name: 'Player 4', chips: 2000 },
    { name: 'Player 5', chips: 1200 },
    { name: 'Player 6', chips: 900 },
  ];
  */

  // Select only the state you need
  const tablePositions = useGameState(state => state.tablePositions);
  const players = useGameState(state => state.players);


  console.log('GAME STATE', useGameState(state => state))


  // Get actions
  const actions = useGameActions();

  // Join as player handler
  /*
  const handleJoinTable = (position: number) => {
    if (!gameIdState) return;

    const user = useLocalStorageUser();
    gameSocketActions.joinAsPlayer(gameIdState, user.id, 100, position);
  }
    */

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      <div className="relative w-full max-w-4xl aspect-[16/9]">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2" >
          <button
            type="button"
            onClick={() => () => 0}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Sit on table
          </button>
        </div>
        <div className="absolute inset-0 bg-emerald-800 rounded-[35%] shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-[url('/felt-texture.png')] opacity-20 mix-blend-multiply" />
          <div className="absolute inset-2 border-2 border-blue-400/30 rounded-[35%]" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/5 to-black/20" />
        </div>
        <div className="absolute inset-[15%] flex items-center justify-center -translate-y-6">
          <Chip amount={250} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center translate-y-6">
          <CommunityCards cards={[]} />
        </div>
        {tablePositions.map((tablePosition, index) => {
          const positionPlayer = players.find(player => player.id === tablePosition.playerId);
          return (
            <TablePosition key={tablePosition.id} tablePosition={tablePosition} player={positionPlayer} />
          )
        })}
      </div>
    </div>
  );
};
