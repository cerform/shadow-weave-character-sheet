import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface StatsPanelProps {
  character?: Character | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Характеристики</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {character && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Сила</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.strength || 10)}
                </Badge>
              </div>
              <Progress value={(character.strength || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Ловкость</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.dexterity || 10)}
                </Badge>
              </div>
              <Progress value={(character.dexterity || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Телосложение</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.constitution || 10)}
                </Badge>
              </div>
              <Progress value={(character.constitution || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Интеллект</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.intelligence || 10)}
                </Badge>
              </div>
              <Progress value={(character.intelligence || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Мудрость</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.wisdom || 10)}
                </Badge>
              </div>
              <Progress value={(character.wisdom || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>Харизма</span>
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}>
                  {getModifier(character.charisma || 10)}
                </Badge>
              </div>
              <Progress value={(character.charisma || 10) * 5} max={100} style={{ backgroundColor: currentTheme.background, color: currentTheme.accent }} />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <span style={{ color: currentTheme.mutedTextColor }}>
          Бонус мастерства: {character?.proficiencyBonus || 2}
        </span>
        <span style={{ color: currentTheme.mutedTextColor }}>
          Класс брони: {character?.armorClass || 10}
        </span>
      </CardFooter>
    </Card>
  );
};
