import { createFileRoute } from '@tanstack/react-router';
import { PokerTable } from '@/components/game/PokerTable';

export const Route = createFileRoute('/games/$gameId')({
  component: PokerTable,
});
