import { PlayerPosition } from '@/components/game/PlayerPosition';
import { Chip } from '@/components/shared';
import { Player } from '@/types';
import { CommunityCards } from './CommunityCards';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useParams } from '@tanstack/react-router';
import { BetButton } from './BetButton';

export const PokerTable = () => {
  console.log('Poker Table Rendering')
  const { gameId } = useParams({ from: '/games/$gameId' });
  const gameIdNumeric = parseInt(gameId, 10);

  const players: Player[] = [
    { name: 'You', chips: 1000, cards: [{ suit: 'heart', value: 'A' }, { suit: 'spade', value: 'K' }] },
    { name: 'Player 2', chips: 1500 },
    { name: 'Player 3', chips: 800 },
    { name: 'Player 4', chips: 2000 },
    { name: 'Player 5', chips: 1200 },
    { name: 'Player 6', chips: 900 },
  ];

  const socket = useGameSocket(gameIdNumeric);

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      <div className="relative w-full max-w-4xl aspect-[16/9]">
        <div className="absolute inset-0 bg-emerald-800 rounded-[35%] shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-[url('/felt-texture.png')] opacity-20 mix-blend-multiply" />
          <div className="absolute inset-2 border-2 border-blue-400/30 rounded-[35%]" />
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/5 to-black/20" />
        </div>
        <div className="absolute inset-[15%] flex items-center justify-center -translate-y-6">
          <Chip amount={250} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center translate-y-6">
          <CommunityCards />
          <BetButton gameId={gameIdNumeric} amount={100} />
          <button type="button" onClick={() => {
            socket.onGameUpdate((event) => {
              console.log(`GAME UPDATE {${event.type}} FROM SERVER`, event.payload);
            });
            socket.joinGame()
          }}>Sit on table</button>
        </div>
        {players.map((player, index) => (
          <PlayerPosition key={index} position={index} player={player} isDealer={index === 0} />
        ))}
      </div>
    </div>
  );
};
