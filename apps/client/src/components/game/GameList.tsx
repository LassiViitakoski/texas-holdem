import { Link } from '@tanstack/react-router';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/Button';

export const GameList = () => {
  const { data: games, isLoading } = useGames();

  if (isLoading) {
    return <div>Loading...</div>;
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
