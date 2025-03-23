import { createFileRoute } from '@tanstack/react-router';
import { LoginLayout } from '@/components/layout/LoginLayout';

export const Route = createFileRoute('/login/')({
  component: LoginLayout,
});
