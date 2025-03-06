import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/games/$gameId')({
  component: GameRouteComponent,
  loader: async ({ params }) => {
    return {
      gameId: parseInt(params.gameId, 10)
    }
  }
});

function GameRouteComponent() {
  return <div>Details about the game</div>;
}