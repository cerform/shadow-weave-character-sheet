
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';

interface CharacterContentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  section: 'resources' | 'skills';
}

const CharacterContent: React.FC<CharacterContentProps> = ({ 
  character, 
  onUpdate,
  section 
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  
  // Заглушка для themes - чтобы компилятор не выдавал ошибки
  const themes = {
    default: {
      textColor: '#FFFFFF'
    }
  };
  
  const currentTheme = themes[themeKey] || themes.default;

  // Функция для безопасного отображения инициативы
  const displayInitiative = () => {
    if (character.initiative !== undefined) {
      if (typeof character.initiative === 'number') {
        return character.initiative >= 0 ? `+${character.initiative}` : `${character.initiative}`;
      }
      return character.initiative;
    }
    return '+0';
  };

  // Отображаем разное содержимое в зависимости от выбранной секции
  if (section === 'resources') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Ресурсы персонажа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Очки здоровья */}
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.textColor }}>Здоровье:</span>
              <div className="flex items-center">
                <span style={{ color: currentTheme.textColor }}>{character.currentHp || 0}/{character.maxHp || 0}</span>
              </div>
            </div>
            
            {/* Класс доспеха */}
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.textColor }}>Класс доспеха:</span>
              <span style={{ color: currentTheme.textColor }}>{character.armorClass || 10}</span>
            </div>
            
            {/* Инициатива */}
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.textColor }}>Инициатива:</span>
              <span style={{ color: currentTheme.textColor }}>
                {displayInitiative()}
              </span>
            </div>
            
            {/* Скорость */}
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.textColor }}>Скорость:</span>
              <span style={{ color: currentTheme.textColor }}>{character.speed || '30 фт'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else if (section === 'skills') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Навыки и умения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {character.skills && typeof character.skills === 'object' && Object.entries(character.skills).map(([skillName, skillValue]) => (
              <div key={`skill-${skillName}`} className="flex justify-between items-center">
                <span style={{ color: currentTheme.textColor }}>{skillName}</span>
                <span style={{ color: currentTheme.textColor }}>
                  {typeof skillValue === 'number' && (skillValue >= 0 ? `+${skillValue}` : `${skillValue}`)}
                  {typeof skillValue === 'object' && 'value' in skillValue && 
                    (skillValue.value !== undefined && typeof skillValue.value === 'number' && skillValue.value >= 0 ? 
                      `+${skillValue.value}` : String(skillValue.value))}
                  {typeof skillValue === 'object' && 'bonus' in skillValue && 
                    (skillValue.bonus !== undefined && typeof skillValue.bonus === 'number' && skillValue.bonus >= 0 ? 
                      `+${skillValue.bonus}` : String(skillValue.bonus))}
                </span>
              </div>
            ))}
            {(!character.skills || Object.keys(character.skills).length === 0) && (
              <div className="text-center text-muted-foreground">
                Нет доступных навыков
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default CharacterContent;
