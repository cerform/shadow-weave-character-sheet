
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getAbilityScore } from '@/utils/characterNormalizer';
import { 
  calculateAbilityModifier, 
  formatModifier, 
  calculateProficiencyBonusByLevel 
} from '@/utils/characterCalculations';

interface StatsPanelProps {
  character?: Character | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  if (!character) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Характеристики</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Персонаж не загружен</p>
        </CardContent>
      </Card>
    );
  }

  const abilities = {
    strength: getAbilityScore(character, 'strength'),
    dexterity: getAbilityScore(character, 'dexterity'),
    constitution: getAbilityScore(character, 'constitution'),
    intelligence: getAbilityScore(character, 'intelligence'),
    wisdom: getAbilityScore(character, 'wisdom'),
    charisma: getAbilityScore(character, 'charisma')
  };

  const proficiencyBonus = calculateProficiencyBonusByLevel(character.level);

  const abilityInfo = [
    { name: 'Сила', key: 'strength', value: abilities.strength },
    { name: 'Ловкость', key: 'dexterity', value: abilities.dexterity },
    { name: 'Телосложение', key: 'constitution', value: abilities.constitution },
    { name: 'Интеллект', key: 'intelligence', value: abilities.intelligence },
    { name: 'Мудрость', key: 'wisdom', value: abilities.wisdom },
    { name: 'Харизма', key: 'charisma', value: abilities.charisma }
  ];

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Характеристики</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {abilityInfo.map(({ name, key, value }) => {
          const modifier = calculateAbilityModifier(value);
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: currentTheme.textColor }}>{name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{value}</span>
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: currentTheme.accent, 
                      color: currentTheme.textColor 
                    }}
                  >
                    {formatModifier(modifier)}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={Math.min((value / 20) * 100, 100)} 
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <div className="flex justify-between w-full">
          <span style={{ color: currentTheme.mutedTextColor }}>
            Бонус мастерства: +{proficiencyBonus}
          </span>
          <span style={{ color: currentTheme.mutedTextColor }}>
            Уровень: {character.level}
          </span>
        </div>
        <div className="flex justify-between w-full">
          <span style={{ color: currentTheme.mutedTextColor }}>
            Инициатива: {formatModifier(calculateAbilityModifier(abilities.dexterity))}
          </span>
          <span style={{ color: currentTheme.mutedTextColor }}>
            КД: {character.armorClass || 10 + calculateAbilityModifier(abilities.dexterity)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
