import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/Button';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="p-4 rounded-md bg-red-50 border border-red-100">
    <h2 className="text-lg font-semibold text-red-800">Something went wrong S</h2>
    <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
    <Button
      onClick={resetErrorBoundary}
      variant="outline"
      className="mt-4"
    >
      Try again
    </Button>
  </div>
);