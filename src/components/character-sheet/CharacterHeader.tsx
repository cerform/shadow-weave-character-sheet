
import React from 'react';
import { Card } from "@/components/ui/card";
import { Character } from '@/types/character';

interface CharacterHeaderProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

export const CharacterHeader = ({ character, onUpdate }: CharacterHeaderProps) => {
  console.log('CharacterHeader: Отображение персонажа', character);
  
  // Функция для получения класса персонажа с учетом различных форматов данных
  const getCharacterClass = (): string => {
    if (!character) return '—';
    
    // Проверяем все возможные места хранения класса с безопасным доступом
    const classValue = character.className || character.class;
    return typeof classValue === 'string' && classValue.trim() !== ''
      ? classValue
      : 'Неизвестный класс';
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h1 className="text-2xl font-bold text-center mb-2">
        {character.name || 'Безымянный герой'}
      </h1>
      <div className="flex justify-center items-center gap-2">
        <span className="text-muted-foreground">{getCharacterClass()}</span>
        {character.level !== undefined && (
          <span className="text-muted-foreground">Уровень {character.level}</span>
        )}
      </div>
    </Card>
  );
};
