import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <AlertTriangle size={32} className="text-destructive" />
      <p className="text-sm text-muted-foreground text-center max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          RETRY
        </Button>
      )}
    </div>
  );
}
