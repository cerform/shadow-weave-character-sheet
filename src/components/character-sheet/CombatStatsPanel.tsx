
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity, Target } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CombatStatsPanelProps {
  character: any;
}

const CombatStatsPanel: React.FC<CombatStatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Calculate ability modifiers
  const getDexModifier = () => {
    const dexScore = character?.abilities?.dexterity || 10;
    return Math.floor((dexScore - 10) / 2);
  };
  
  // Calculate AC
  const getArmorClass = () => {
    const baseAC = 10;
    const dexMod = getDexModifier();
    // Simple calculation, would need to be expanded based on armor and abilities
    return baseAC + dexMod;
  };
  
  // Calculate proficiency bonus
  const getProficiencyBonus = () => {
    const level = character?.level || 1;
    return Math.ceil(1 + (level / 4));
  };
  
  // Get initiative
  const getInitiative = () => {
    return getDexModifier();
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          Боевые характеристики
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <Shield className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">КД</span>
            <span className="text-lg font-bold">{getArmorClass()}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Activity className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Инициатива</span>
            <span className="text-lg font-bold">
              {getInitiative() >= 0 ? `+${getInitiative()}` : getInitiative()}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <Target className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs text-muted-foreground">Бонус мастерства</span>
            <span className="text-lg font-bold">+{getProficiencyBonus()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombatStatsPanel;
