
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';

interface SpellCardProps {
  spell: SpellData;
  onClick: () => void;
  currentTheme: any;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, currentTheme }) => {
  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer border p-4"
      onClick={onClick}
      style={{
        backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)',
        borderColor: currentTheme.accent,
        color: currentTheme.textColor
      }}
    >
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{spell.name}</h3>
          <Badge
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
          </Badge>
        </div>
        <div className="text-sm mb-2">
          {spell.school}
          {spell.ritual && " (Ритуал)"}
          {spell.concentration && " (Концентрация)"}
        </div>
        <div className="text-xs opacity-70">
          {typeof spell.classes === 'string' 
            ? spell.classes 
            : Array.isArray(spell.classes) 
              ? spell.classes.join(', ') 
              : ''}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellCard;
