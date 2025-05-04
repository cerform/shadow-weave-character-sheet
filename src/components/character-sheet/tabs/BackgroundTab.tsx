
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCharacter } from '@/contexts/CharacterContext';

export const BackgroundTab = () => {
  const { character, updateCharacter } = useCharacter();
  
  // Локальные состояния для работы с текстом
  const [backstory, setBackstory] = useState(character?.backstory || "");
  const [appearance, setAppearance] = useState(character?.appearance || "");
  const [personalityTraits, setPersonalityTraits] = useState(character?.personalityTraits || "");
  const [ideals, setIdeals] = useState(character?.ideals || "");
  const [bonds, setBonds] = useState(character?.bonds || "");
  const [flaws, setFlaws] = useState(character?.flaws || "");
  
  // Обновляем значения при изменении персонажа
  useEffect(() => {
    if (character) {
      setBackstory(character.backstory || "");
      setAppearance(character.appearance || "");
      setPersonalityTraits(character.personalityTraits || "");
      setIdeals(character.ideals || "");
      setBonds(character.bonds || "");
      setFlaws(character.flaws || "");
    }
    
    return () => {
      // Очистка при размонтировании
      console.log("Очистка ресурсов BackgroundTab");
    };
  }, [character]);
  
  // Функция для сохранения изменений с задержкой
  const saveChanges = (field: string, value: string) => {
    if (character) {
      updateCharacter({ [field]: value });
    }
  };
  
  // Обработчики изменения текста с debounce
  const handleBackstoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBackstory(value);
    // Используем setTimeout для debounce эффекта
    setTimeout(() => saveChanges('backstory', value), 500);
  };
  
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAppearance(value);
    setTimeout(() => saveChanges('appearance', value), 500);
  };
  
  const handlePersonalityChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPersonalityTraits(value);
    setTimeout(() => saveChanges('personalityTraits', value), 500);
  };
  
  const handleIdealsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIdeals(value);
    setTimeout(() => saveChanges('ideals', value), 500);
  };
  
  const handleBondsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBonds(value);
    setTimeout(() => saveChanges('bonds', value), 500);
  };
  
  const handleFlawsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFlaws(value);
    setTimeout(() => saveChanges('flaws', value), 500);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Предыстория персонажа</h3>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-1">Предыстория персонажа</h4>
          <Textarea 
            value={backstory}
            onChange={handleBackstoryChange}
            placeholder="Опишите историю вашего персонажа..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-1">Внешность</h4>
          <Textarea 
            value={appearance}
            onChange={handleAppearanceChange}
            placeholder="Опишите внешность вашего персонажа..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-1">Личностные черты</h4>
            <Textarea 
              value={personalityTraits}
              onChange={handlePersonalityChange}
              placeholder="Какие качества отличают вашего персонажа?"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-1">Идеалы</h4>
            <Textarea 
              value={ideals}
              onChange={handleIdealsChange}
              placeholder="Во что верит ваш персонаж?"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-1">Узы</h4>
            <Textarea 
              value={bonds}
              onChange={handleBondsChange}
              placeholder="С чем или кем связан ваш персонаж?"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-1">Слабости</h4>
            <Textarea 
              value={flaws}
              onChange={handleFlawsChange}
              placeholder="Какие недостатки есть у вашего персонажа?"
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
