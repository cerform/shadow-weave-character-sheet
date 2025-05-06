
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm border border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Нет персонажей
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-8 px-4 space-y-4">
          <div className="rounded-full bg-primary/10 p-6">
            <FilePlus size={64} className="text-primary/60" />
          </div>
          <p className="text-center text-muted-foreground">
            У вас пока нет созданных персонажей. Создайте своего первого персонажа, чтобы начать приключение!
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => navigate('/character-creation')}
          className="gap-2"
        >
          <FilePlus size={16} />
          Создать персонажа
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmptyState;
