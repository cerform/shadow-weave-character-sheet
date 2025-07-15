
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getAbilityScore } from '@/utils/characterNormalizer';
import { 
  calculateAbilityModifier, 
  formatModifier, 
  calculateProficiencyBonusByLevel 
} from '@/utils/characterCalculations';
import { 
  Zap, 
  Target, 
  Heart, 
  Brain, 
  Eye, 
  Sparkles 
} from 'lucide-react';

interface StatsPanelProps {
  character?: Character | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  if (!character) {
    return (
      <Card className="rpg-panel">
        <CardHeader>
          <CardTitle className="font-fantasy-header text-glow">Характеристики</CardTitle>
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
    { 
      name: 'Сила', 
      short: 'СИЛ',
      key: 'strength', 
      value: abilities.strength, 
      icon: Zap,
      color: 'hsl(var(--str-color))',
      description: 'Физическая мощь, влияет на урон в ближнем бою и грузоподъемность'
    },
    { 
      name: 'Ловкость', 
      short: 'ЛОВ',
      key: 'dexterity', 
      value: abilities.dexterity, 
      icon: Target,
      color: 'hsl(var(--dex-color))',
      description: 'Проворность и скорость реакций, влияет на КД и инициативу'
    },
    { 
      name: 'Телосложение', 
      short: 'ТЕЛ',
      key: 'constitution', 
      value: abilities.constitution, 
      icon: Heart,
      color: 'hsl(var(--con-color))',
      description: 'Выносливость и жизненная сила, определяет очки здоровья'
    },
    { 
      name: 'Интеллект', 
      short: 'ИНТ',
      key: 'intelligence', 
      value: abilities.intelligence, 
      icon: Brain,
      color: 'hsl(var(--int-color))',
      description: 'Способность к рассуждению и память, важен для заклинателей'
    },
    { 
      name: 'Мудрость', 
      short: 'МУД',
      key: 'wisdom', 
      value: abilities.wisdom, 
      icon: Eye,
      color: 'hsl(var(--wis-color))',
      description: 'Восприятие и интуиция, важен для клериков и друидов'
    },
    { 
      name: 'Харизма', 
      short: 'ХАР',
      key: 'charisma', 
      value: abilities.charisma, 
      icon: Sparkles,
      color: 'hsl(var(--cha-color))',
      description: 'Сила личности и магическое присутствие'
    }
  ];

  return (
    <TooltipProvider>
      <Card className="rpg-panel-elevated">
        <CardHeader className="pb-4">
          <CardTitle className="font-fantasy-header text-glow flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Характеристики
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ability Scores Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {abilityInfo.map(({ name, short, key, value, icon: Icon, color, description }) => {
              const modifier = calculateAbilityModifier(value);
              
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div className={`ability-card ability-card-${key}`}>
                      <div className="flex items-center justify-center mb-2">
                        <Icon 
                          className="h-6 w-6" 
                          style={{ color }} 
                        />
                      </div>
                      <div className="text-xs font-fantasy-body text-muted-foreground mb-1">
                        {short}
                      </div>
                      <div className="text-2xl font-fantasy-header font-bold mb-1">
                        {value}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-1"
                        style={{ 
                          backgroundColor: `${color}20`, 
                          color: color,
                          border: `1px solid ${color}40`
                        }}
                      >
                        {formatModifier(modifier)}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="font-fantasy-body">
                      <div className="font-semibold text-sm mb-1">{name}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                      <div className="text-xs mt-2">
                        <span className="font-medium">Значение:</span> {value} 
                        <span className="ml-2 font-medium">Модификатор:</span> {formatModifier(modifier)}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Combat Stats */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                <div className="text-xs font-fantasy-body text-muted-foreground mb-1">
                  Бонус мастерства
                </div>
                <div className="text-lg font-fantasy-header font-bold text-primary">
                  +{proficiencyBonus}
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="text-xs font-fantasy-body text-muted-foreground mb-1">
                  Инициатива
                </div>
                <div className="text-lg font-fantasy-header font-bold text-green-400">
                  {formatModifier(calculateAbilityModifier(abilities.dexterity))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="text-xs font-fantasy-body text-muted-foreground mb-1">
                  Класс Доспеха
                </div>
                <div className="text-lg font-fantasy-header font-bold text-blue-400">
                  {character.armorClass || 10 + calculateAbilityModifier(abilities.dexterity)}
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/30">
                <div className="text-xs font-fantasy-body text-muted-foreground mb-1">
                  Уровень
                </div>
                <div className="text-lg font-fantasy-header font-bold text-purple-400">
                  {character.level}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
