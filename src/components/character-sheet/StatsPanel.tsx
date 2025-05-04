
import React from 'react';
import { Card } from "@/components/ui/card";
import { Character } from '@/contexts/CharacterContext';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface StatsPanelProps {
  character: Character | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Рассчитываем бонус мастерства на основе уровня
  const calculateProficiencyBonus = () => {
    if (!character || !character.level) return 2;
    
    const level = character.level;
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6; // Уровни 17-20
  };

  // Получаем модификатор для характеристики
  const getModifier = (score: number | undefined) => {
    if (score === undefined) return "+0";
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20 p-4">
      {/* Информация о бонусе мастерства - компактный формат */}
      <div className="mb-4 rounded-lg bg-primary/10 p-3 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-primary mb-1">Бонус мастерства</h3>
          <p className="text-xs text-muted-foreground">
            Уровень: {character?.level || 1}
          </p>
        </div>
        <div className="text-xl font-bold text-primary bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center">
          +{calculateProficiencyBonus()}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        Спасброски
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Сила</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.STR)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Телосложение</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.CON)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Мудрость</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.WIS)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Ловкость</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.DEX)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Интеллект</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.INT)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Харизма</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.CHA)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
        </div>
      </div>
    </Card>
  );
};
