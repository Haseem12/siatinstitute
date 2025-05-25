"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] p-4">
      <Card className="w-full max-w-lg text-center shadow-xl border-destructive">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive mt-4">Oops! Something went wrong.</CardTitle>
          <CardDescription className="text-muted-foreground">
            We encountered an unexpected issue. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error?.message && (
            <details className="text-left bg-muted/50 p-3 rounded-md text-xs">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{error.message}</pre>
              {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
            </details>
          )}
          <Button
            onClick={() => reset()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Try Again
          </Button>
           <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
