
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  minimal?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onClick,
  minimal = false 
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Проанализируем данные персонажа для поиска проблем
  const characterIssues = useMemo(() => {
    const issues = [];
    
    // Проверка основных полей
    if (!character.id) issues.push('Отсутствует ID');
    if (!character.userId) issues.push('Отсутствует userId');
    if (!character.name) issues.push('Отсутствует имя');
    if (!character.race && !character.className && !character.class) {
      issues.push('Отсутствуют основные характеристики');
    }
    
    return issues;
  }, [character]);
  
  // Выводим данные персонажа для отладки
  console.log('CharacterCard: Отрисовка персонажа:', character.name || 'Без имени', character);
  console.log('CharacterCard: Проблемы с персонажем:', characterIssues.length > 0 ? characterIssues : 'нет');
  
  // Получаем класс персонажа из разных возможных полей с безопасной проверкой
  const getCharacterClass = (): string => {
    // Проверяем разные варианты хранения класса
    if (typeof character.className === 'string' && character.className.trim() !== '') {
      return character.className;
    } else if (typeof character.class === 'string' && character.class.trim() !== '') {
      return character.class;
    }
    return 'Неизвестный класс';
  };
  
  // Получаем уровень персонажа с безопасным значением по умолчанию
  const getCharacterLevel = (): string => {
    if (character.level !== undefined) {
      return `${character.level} уровень`;
    }
    return '1 уровень';
  };

  // Формируем заголовок карточки с безопасным значением по умолчанию
  const characterTitle = character.name || 'Безымянный персонаж';

  // Формируем подзаголовок карточки с безопасными значениями
  const raceValue = character.race || 'Неизвестная раса';
  const classValue = getCharacterClass();
  const characterSubtitle = `${raceValue} ${classValue}`;

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        minimal 
          ? 'cursor-pointer hover:shadow-md' 
          : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      <CardContent className={minimal ? 'p-3' : 'p-5'}>
        <div className="flex justify-between items-start">
          <CardTitle className="mb-1" style={{ color: currentTheme.accent }}>
            {characterTitle}
          </CardTitle>
          
          {characterIssues.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle size={12} />
              <span>Проблемы</span>
            </Badge>
          )}
        </div>
        
        <CardDescription className="mb-4">
          {characterSubtitle}
        </CardDescription>
        
        {!minimal && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Уровень:</span>
                <span className="font-medium">{getCharacterLevel()}</span>
              </div>
              
              {character.race && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Раса:</span>
                  <span className="font-medium">{character.race}</span>
                </div>
              )}
              
              {character.alignment && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Мировоззрение:</span>
                  <span className="font-medium">{character.alignment || 'Не указано'}</span>
                </div>
              )}
              
              {character.background && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Предыстория:</span>
                  <span className="font-medium">{character.background || 'Без предыстории'}</span>
                </div>
              )}
              
              {character.subclass && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Архетип:</span>
                  <span className="font-medium">{character.subclass}</span>
                </div>
              )}
            </div>
            
            {characterIssues.length > 0 && (
              <div className="mb-4 p-2 bg-red-950/30 border border-red-500/30 rounded text-xs text-red-400">
                <div className="font-semibold mb-1">Обнаружены проблемы с данными:</div>
                <ul className="list-disc pl-4">
                  {characterIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Открыть
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
