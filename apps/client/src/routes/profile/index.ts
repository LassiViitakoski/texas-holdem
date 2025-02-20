import { createFileRoute } from '@tanstack/react-router';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});
