
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-black/50 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <UserPlus size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Список персонажей пуст</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          У вас пока нет созданных персонажей. Создайте своего первого героя, чтобы начать приключение!
        </p>
        <Button onClick={() => navigate('/character-creation')}>
          Создать первого персонажа
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
