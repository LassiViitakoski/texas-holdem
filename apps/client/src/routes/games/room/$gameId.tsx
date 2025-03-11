import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { PokerTable } from '@/components/game/PokerTable';
import { initializeGameSocket } from '@/services/gameSocket';
import { useLocalStorageUser } from '@/hooks/useUsers';

export const Route = createFileRoute('/games/room/$gameId')({
  component: GameRouteComponent,
  loader: async ({ params }) => {
    return {
      gameId: parseInt(params.gameId, 10)
    }
  },
});

function GameRouteComponent() {
  // Explicitly type the loader data
  const { gameId } = useLoaderData({ from: '/games/room/$gameId' })
  const user = useLocalStorageUser();

  initializeGameSocket(gameId, user.id);

  return <PokerTable />;
}

