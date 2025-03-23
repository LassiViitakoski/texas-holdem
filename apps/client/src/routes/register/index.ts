import { createFileRoute } from '@tanstack/react-router';
import { RegisterLayout } from '@/components/layout/RegisterLayout';

export const Route = createFileRoute('/register/')({
  component: RegisterLayout,
});

