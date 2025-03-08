import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { PokerTable } from '@/components/game/PokerTable';
import { initializeGameSocket } from '@/services/gameSocket';
import { useLocalStorageUser } from '@/hooks/useUsers';
import { useGameContext, useGameActions } from '@/contexts/GameContext';
import { useEffect } from 'react';
import { gameActions } from '@/stores/gameStore';
import { socketService } from '@/services/socket';
import { useGameSocket } from '@/hooks/useGameSocket';

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

  console.log('gameId', gameId);

  const user = useLocalStorageUser();
  const { store } = useGameContext();

  initializeGameSocket(gameId, user.id, store);

  return <PokerTable />;
}

