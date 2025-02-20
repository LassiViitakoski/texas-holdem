import { createFileRoute } from '@tanstack/react-router';
import { CreateGameForm } from '@/components/game/CreateGameForm';

export const Route = createFileRoute('/games/create')({
  component: CreateGameForm,
});
