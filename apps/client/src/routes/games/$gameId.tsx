import { createFileRoute } from '@tanstack/react-router';
import { PokerTable } from '@/components/game/PokerTable';
import { initializeGameSocket } from '@/services/gameSocket';
import { useLocalStorageUser } from '@/hooks/useUsers';
import { useGameContext, useGameActions } from '@/contexts/GameContext';
import { useEffect } from 'react';

// Define the loader data type
interface LoaderData {
  gameId: number;
}

export const Route = createFileRoute('/games/$gameId')({
  component: GameRouteComponent,
  beforeLoad: ({ params }): LoaderData => {
    // Return the parsed gameId for use in the component
    return {
      gameId: parseInt(params.gameId, 10)
    };
  }
});

function GameRouteComponent() {
  // Explicitly type the loader data
  const { gameId } = Route.useLoaderData() as LoaderData;
  const user = useLocalStorageUser();
  const { store } = useGameContext();
  const actions = useGameActions();

  // Set up socket connection and store initialization
  useEffect(() => {
    // Update store with game ID and spectator status
    actions.setGameId(gameId);
    actions.setAsSpectator(true);

    // Initialize socket connection
    const cleanup = initializeGameSocket(gameId, user.id, store);

    // Clean up on unmount
    return cleanup;
  }, [gameId, user.id, store, actions]);

  return <PokerTable />;
}

