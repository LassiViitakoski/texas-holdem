import { Outlet, Link } from '@tanstack/react-router';
import { GameProvider } from '@/contexts/GameContext';

export const GameRoomLayout = () => (
  <div className="flex">
    <nav>
      <Link to="/games/room/$gameId" params={{ gameId: '1' }}>Table 1</Link>
      <Link to="/games/room/$gameId" params={{ gameId: '2' }}>Table 2</Link>
    </nav>
    <main className="flex-1 p-4">
      <GameProvider>
        <Outlet />
      </GameProvider>
    </main>
  </div>
);
