
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Dices } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet } from "@/types/character";

interface CharacterAbilitiesProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterAbilities: React.FC<CharacterAbilitiesProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { toast } = useToast();
  const [abilities, setAbilities] = useState({
    STR: character.abilities?.STR || 10,
    DEX: character.abilities?.DEX || 10,
    CON: character.abilities?.CON || 10,
    INT: character.abilities?.INT || 10,
    WIS: character.abilities?.WIS || 10,
    CHA: character.abilities?.CHA || 10
  });
  
  // Функция для генерации случайных значений характеристик
  const rollAbilities = () => {
    const newAbilities = {
      STR: rollStat(),
      DEX: rollStat(),
      CON: rollStat(),
      INT: rollStat(),
      WIS: rollStat(),
      CHA: rollStat()
    };
    
    setAbilities(newAbilities);
    toast({
      title: "Кубики брошены!",
      description: "Ваши характеристики были сгенерированы случайным образом."
    });
  };
  
  // Функция для броска кубиков 4d6 с отбрасыванием наименьшего
  const rollStat = (): number => {
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  };
  
  // Обработчик изменения значения способности
  const handleAbilityChange = (ability: keyof typeof abilities, value: string) => {
    const numValue = parseInt(value) || 0;
    setAbilities(prev => ({
      ...prev,
      [ability]: Math.min(Math.max(numValue, 3), 18) // Ограничиваем значения от 3 до 18
    }));
  };
  
  // Функция для расчета модификатора характеристики
  const getAbilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    // Расширенное обновление для поддержки обоих форматов имен характеристик
    const updatedAbilities = {
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA,
      strength: abilities.STR,
      dexterity: abilities.DEX,
      constitution: abilities.CON,
      intelligence: abilities.INT,
      wisdom: abilities.WIS,
      charisma: abilities.CHA
    };
    
    updateCharacter({ abilities: updatedAbilities });
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Характеристики персонажа</h1>
      
      <Card className="p-6">
        <Button 
          onClick={rollAbilities} 
          className="mb-6 w-full"
        >
          <Dices className="mr-2" />
          Сгенерировать случайные характеристики
        </Button>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="str">Сила (STR)</Label>
            <div className="flex items-center">
              <Input 
                id="str"
                value={abilities.STR}
                onChange={(e) => handleAbilityChange("STR", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.STR)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dex">Ловкость (DEX)</Label>
            <div className="flex items-center">
              <Input 
                id="dex"
                value={abilities.DEX}
                onChange={(e) => handleAbilityChange("DEX", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.DEX)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="con">Телосложение (CON)</Label>
            <div className="flex items-center">
              <Input 
                id="con"
                value={abilities.CON}
                onChange={(e) => handleAbilityChange("CON", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.CON)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="int">Интеллект (INT)</Label>
            <div className="flex items-center">
              <Input 
                id="int"
                value={abilities.INT}
                onChange={(e) => handleAbilityChange("INT", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.INT)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wis">Мудрость (WIS)</Label>
            <div className="flex items-center">
              <Input 
                id="wis"
                value={abilities.WIS}
                onChange={(e) => handleAbilityChange("WIS", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.WIS)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cha">Харизма (CHA)</Label>
            <div className="flex items-center">
              <Input 
                id="cha"
                value={abilities.CHA}
                onChange={(e) => handleAbilityChange("CHA", e.target.value)}
                type="number"
                min={3}
                max={18}
                className="mr-2"
              />
              <span className="text-lg font-medium w-12 text-center">
                {getAbilityModifier(abilities.CHA)}
              </span>
            </div>
          </div>
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
          >
            Далее
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterAbilities;
