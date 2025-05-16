import React from "react";
import { AlertTriangle, Database, ServerOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DatabaseStatusBannerProps {
  isUsingFallbackData: boolean;
}

export function DatabaseStatusBanner({ isUsingFallbackData }: DatabaseStatusBannerProps) {
  if (!isUsingFallbackData) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <ServerOff className="h-4 w-4 mr-2" />
      <AlertTitle className="font-bold flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Database Connection Unavailable
      </AlertTitle>
      <AlertDescription>
        <p>
          You are currently viewing sample data due to database connection issues. 
          Editing functionality is disabled until the database connection is restored.
        </p>
        <p className="mt-2 text-sm">
          This is typically a temporary issue. Please try again later or contact technical support if the problem persists.
        </p>
      </AlertDescription>
    </Alert>
  );
}