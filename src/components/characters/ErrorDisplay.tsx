
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, onRetry }) => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Ошибка при загрузке персонажей
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">Произошла ошибка при загрузке персонажей:</p>
        <div className="p-3 bg-black/30 rounded border border-destructive/20 text-sm font-mono">
          {errorMessage}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onRetry}
          className="gap-2"
          variant="outline"
        >
          <RefreshCw size={16} />
          Попробовать снова
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorDisplay;
