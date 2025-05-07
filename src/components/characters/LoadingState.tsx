
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoadingStateProps {
  text?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Загрузка...' }) => {
  return (
    <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-4">
      <CardHeader>
        <CardTitle className="text-xl text-center">Загрузка...</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
