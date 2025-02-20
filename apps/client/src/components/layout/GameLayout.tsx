import { Outlet } from '@tanstack/react-router';

export const GameLayout = () => (
  <div className="flex">
    <main className="flex-1 p-4">
      <Outlet />
    </main>
  </div>
);
