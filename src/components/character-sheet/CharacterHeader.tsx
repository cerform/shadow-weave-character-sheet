
import React, { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Character } from '@/types/character';
import { normalizeCharacterData } from '@/utils/characterNormalizer';

interface CharacterHeaderProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

export const CharacterHeader = ({ character, onUpdate }: CharacterHeaderProps) => {
  console.log('CharacterHeader: Отображение персонажа', character);
  
  // Эффект для отладки при монтировании компонента
  useEffect(() => {
    console.log('CharacterHeader: Компонент смонтирован с персонажем:', character);
    
    // Проверка на проблемы в данных
    if (!character) {
      console.error('CharacterHeader: character is null/undefined');
      return;
    }
    
    // Проверяем наличие класса в разных форматах
    const hasClass = character.className || character.class;
    if (!hasClass) {
      console.warn('CharacterHeader: У персонажа отсутствует класс');
    }
    
    // Сравниваем character.class и character.className, если оба заданы
    if (character.class && character.className && character.class !== character.className) {
      console.warn('CharacterHeader: Несоответствие между class и className:', {
        class: character.class,
        className: character.className
      });
    }
    
    // Проверяем наличие дублирующих полей с разным регистром
    const keys = Object.keys(character);
    const lowercaseKeys = keys.map(k => k.toLowerCase());
    const duplicateFields = keys.filter(key => {
      const lowercaseKey = key.toLowerCase();
      return key !== lowercaseKey && lowercaseKeys.includes(lowercaseKey);
    });
    
    if (duplicateFields.length > 0) {
      console.warn('CharacterHeader: Обнаружены поля с дублирующимися именами разного регистра:', duplicateFields);
    }
  }, [character]);
  
  // Функция для получения класса персонажа с учетом различных форматов данных
  const getCharacterClass = (): string => {
    if (!character) return '—';
    
    // Проверяем все возможные места хранения класса с безопасным доступом
    const classValue = character.className || character.class;
    return typeof classValue === 'string' && classValue.trim() !== ''
      ? classValue
      : 'Неизвестный класс';
  };

  // Если персонаж не определен, показываем состояние загрузки
  if (!character) {
    return (
      <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
        <h1 className="text-2xl font-bold text-center mb-2 animate-pulse">
          Загрузка персонажа...
        </h1>
      </Card>
    );
  }

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
