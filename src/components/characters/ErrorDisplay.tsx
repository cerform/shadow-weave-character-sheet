
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry?: () => void;
  technicalDetails?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errorMessage, 
  onRetry,
  technicalDetails 
}) => {
  return (
    <Card className="border-red-800/30 bg-black/30">
      <CardHeader className="bg-red-950/30 border-b border-red-800/30">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-7 w-7 text-red-500 mt-1" />
          <div>
            <CardTitle className="text-red-400">Ошибка при загрузке данных</CardTitle>
            <p className="text-sm text-red-300/70 mt-1">
              {errorMessage}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-muted-foreground mb-4">
          Произошла ошибка при попытке загрузить данные. Пожалуйста, повторите попытку или обратитесь к разработчикам, если проблема сохраняется.
        </p>
        
        {technicalDetails && (
          <div className="mt-6 border-t border-red-900/30 pt-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Технические детали</h4>
            <pre className="text-xs bg-black/20 p-3 rounded overflow-auto max-h-[200px]">
              {typeof technicalDetails === 'string' 
                ? technicalDetails 
                : JSON.stringify(technicalDetails, null, 2)
              }
            </pre>
          </div>
        )}
      </CardContent>
      
      {onRetry && (
        <CardFooter className="border-t border-red-900/30 bg-red-950/10">
          <Button 
            variant="outline"
            onClick={onRetry}
            className="border-red-900/30 hover:bg-red-900/20 hover:text-red-300"
          >
            Попробовать снова
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorDisplay;
