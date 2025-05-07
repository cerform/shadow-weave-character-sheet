
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={36} className="text-primary animate-spin" />
        <h3 className="text-xl font-semibold">Загрузка персонажей...</h3>
        <p className="text-muted-foreground">Пожалуйста, подождите</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="overflow-hidden border border-primary/20 bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-10" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-3 border-t border-border/30">
              <Skeleton className="h-8 w-24" />
              <div className="space-x-1">
                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                <Skeleton className="h-8 w-8 rounded-md inline-block" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
