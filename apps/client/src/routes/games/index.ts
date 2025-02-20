import { createFileRoute } from '@tanstack/react-router';
import { GameList } from '@/components/game/GameList';

export const Route = createFileRoute('/games/')({
  component: GameList,
});
