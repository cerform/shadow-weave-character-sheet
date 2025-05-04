
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCharacter } from '@/contexts/CharacterContext';

const LevelUpPanel = () => {
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLevelUp = async () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Здесь можно добавить логику для обработки повышения уровня, например, выбор новых умений, увеличение характеристик и т.д.
      // В данном примере просто увеличиваем уровень персонажа на 1
      const newLevel = (character.level || 0) + 1;

      updateCharacter({ level: newLevel });

      toast({
        title: "Уровень повышен!",
        description: `Персонаж повышен до уровня ${newLevel}.`,
      });
    } catch (error) {
      console.error("Ошибка при повышении уровня:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось повысить уровень персонажа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Повышение уровня</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Текущий уровень: {character?.level || 1}</p>
        <Button 
          onClick={handleLevelUp} 
          className="mt-4"
          disabled={isLoading || !character}
        >
          Повысить уровень
        </Button>
      </CardContent>
    </Card>
  );
};

export default LevelUpPanel;
