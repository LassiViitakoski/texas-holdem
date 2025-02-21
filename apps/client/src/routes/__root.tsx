import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { RootLayout } from '@/components/layout/RootLayout';
import toast from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
          <h1>Application Error</h1>
          <h1>{error.message || 'An unexpected error occurred'}</h1>
        </div>
      )}
      onError={(error) => {
        console.error('Caught by Application Error Boundary: ', error);
        toast.error('Something went wrong. Please try again later.', {
          duration: 50000
        });
      }}
    >
      <RootLayout />
      <TanStackRouterDevtools />
    </ErrorBoundary>
  ),
});
