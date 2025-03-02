import { Outlet } from '@tanstack/react-router';
import { GameProvider } from '@/contexts/GameContext';

export const GameLayout = () => (
  <div className="flex">
    <main className="flex-1 p-4">
      <GameProvider>
        <Outlet />
      </GameProvider>
    </main>
  </div>
);
