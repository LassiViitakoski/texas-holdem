import { createFileRoute } from '@tanstack/react-router';
import { GameList, GameListErrorFallback } from '@/components/game/GameList';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createFileRoute('/games/')({
  component: () => (
    <ErrorBoundary FallbackComponent={GameListErrorFallback}>
      <GameList />
    </ErrorBoundary>
  )
});
