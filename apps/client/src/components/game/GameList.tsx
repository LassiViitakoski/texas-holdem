import { Link } from '@tanstack/react-router';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/Button';
import { FallbackProps, useErrorBoundary } from 'react-error-boundary';

export const GameListErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="p-4 rounded-md bg-red-50">
    <h3 className="font-medium text-red-800">Failed to load games</h3>
    <p className="text-sm text-red-600 mt-1">{error.message}</p>
    <Button
      onClick={resetErrorBoundary}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      Retry
    </Button>
  </div>
);

export const GameList = () => {
  const { data: games, isLoading, isError, error } = useGames();
  const { resetBoundary } = useErrorBoundary()

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <GameListErrorFallback error={error} resetErrorBoundary={resetBoundary} />
  }

  return (

    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Games</h1>
        <Link to="/games/create">
          <Button>Create Game</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games?.map((game) => (
          <Link
            key={game.id}
            to="/games/$gameId"
            params={{ gameId: game.id.toString() }}
            className="block p-4 rounded-lg border hover:border-blue-500 transition-colors"
          >
            <div className="font-medium">
              Game #
              {game.id}
            </div>
            <div className="text-sm text-gray-500">
              Players:
              {' '}
              {game.minimumPlayers}
              -
              {game.maximumPlayers}
            </div>
            <div className="text-sm text-gray-500">
              Blinds:
              {' '}
              {game.blinds.map((b) => b.amount).join('/')}
            </div>
            <div className="mt-2 text-sm font-medium text-blue-600">
              Status:
              {' '}
              {game.status}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
