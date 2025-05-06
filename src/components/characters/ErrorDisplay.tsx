
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, onRetry }) => {
  return (
    <Card className="border-red-500 bg-black/50">
      <CardContent className="text-center py-8">
        <p className="text-red-400 mb-4">{errorMessage}</p>
        <Button onClick={onRetry}>Повторить загрузку</Button>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
