'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Oops! Something went wrong</h1>
          <p className="text-xl mt-2 text-muted-foreground">
            The door control system encountered an unexpected error.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="space-y-4">
            <p className="text-foreground">
              Please try refreshing the page or clicking the button below to retry.
            </p>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={reset} className="bg-primary hover:bg-primary/90 text-white">
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go to Homepage
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              If the problem persists, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 