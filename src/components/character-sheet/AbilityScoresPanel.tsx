
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface AbilityScoresPanelProps {
  character: any;
}

const AbilityScoresPanel: React.FC<AbilityScoresPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Calculate ability modifier
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Get ability scores from character
  const abilities = character?.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };

  // Define ability score labels
  const abilityLabels = {
    strength: 'СИЛ',
    dexterity: 'ЛОВ',
    constitution: 'ВЫН',
    intelligence: 'ИНТ',
    wisdom: 'МДР',
    charisma: 'ХАР'
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          Характеристики
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(abilityLabels).map(([key, label]) => (
            <div 
              key={key}
              className="flex flex-col items-center bg-secondary/50 rounded-md p-2"
              style={{ borderColor: currentTheme.accent }}
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-lg font-bold" style={{ color: currentTheme.textColor }}>
                {abilities[key as keyof typeof abilities]}
              </span>
              <span className="text-xs" style={{ color: currentTheme.accent }}>
                {getModifier(abilities[key as keyof typeof abilities])}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbilityScoresPanel;
