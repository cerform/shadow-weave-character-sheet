
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';
import { ThemeStyles } from '@/types/theme';

export interface SpellCardProps {
  spell: SpellData;
  onClick?: () => void;
  currentTheme: ThemeStyles;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, currentTheme }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const getComponentsString = () => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    return components.join(', ');
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/5"
      onClick={handleClick}
      style={{
        backgroundColor: currentTheme.cardBackground,
        borderColor: currentTheme.accent,
        color: currentTheme.textColor
      }}
    >
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-medium">{spell.name}</span>
            <Badge variant="outline">{spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}</Badge>
          </div>
          
          <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
            <div>{spell.school}</div>
            <div>
              <span>{spell.castingTime || '1 действие'}</span>
              {spell.concentration && <span> • Концентрация</span>}
              {spell.ritual && <span> • Ритуал</span>}
            </div>
            <div>Компоненты: {getComponentsString() || 'Нет'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellCard;
