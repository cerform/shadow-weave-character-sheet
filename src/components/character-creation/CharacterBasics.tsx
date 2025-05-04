
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet } from '@/types/character';

interface CharacterBasicsProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBasics: React.FC<CharacterBasicsProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { toast } = useToast();
  const [name, setName] = useState(character.name || "");
  const [allowNext, setAllowNext] = useState(false);
  
  // Отслеживаем изменения имени для определения возможности перехода к следующему шагу
  useEffect(() => {
    setAllowNext(!!name.trim());
  }, [name]);
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    if (!name.trim()) {
      toast({
        title: "Необходимо указать имя",
        description: "Пожалуйста, введите имя вашего персонажа",
        variant: "destructive"
      });
      return;
    }
    
    updateCharacter({ name });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Создание персонажа: Основы</h1>
      
      <Card className="p-6">
        <div className="mb-6">
          <Label htmlFor="character-name" className="text-lg font-semibold mb-2">
            Имя персонажа
          </Label>
          <Input 
            id="character-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя персонажа"
            className="text-lg"
          />
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
          >
            Назад
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={!allowNext}
          >
            Далее
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterBasics;
