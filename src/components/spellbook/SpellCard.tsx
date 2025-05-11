
import React from 'react';
import { SpellData } from '@/types/spells';
import { ThemeStyles } from '@/types/theme';
import { Badge } from '@/components/ui/badge';

export interface SpellCardProps {
  spell: SpellData;
  currentTheme: ThemeStyles;
  onClick?: () => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, currentTheme, onClick }) => {
  return (
    <div 
      className="p-2 text-sm cursor-pointer"
      onClick={onClick}
      style={{ color: currentTheme.textColor }}
    >
      {spell.castingTime && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">Время накладывания:</span>
          <span>{spell.castingTime}</span>
        </div>
      )}
      
      {spell.range && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">Дистанция:</span>
          <span>{spell.range}</span>
        </div>
      )}
      
      <div className="flex justify-between mb-1">
        <span className="font-medium">Компоненты:</span>
        <div>
          {spell.verbal && <Badge variant="outline" className="mr-1">В</Badge>}
          {spell.somatic && <Badge variant="outline" className="mr-1">С</Badge>}
          {spell.material && <Badge variant="outline">М</Badge>}
        </div>
      </div>
      
      {spell.duration && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">Длительность:</span>
          <span>{spell.duration}</span>
        </div>
      )}
      
      {spell.description && (
        <div className="mt-2 text-sm border-t pt-2" style={{ borderColor: `${currentTheme.borderColor}40` }}>
          {typeof spell.description === 'string' ? (
            <p>{spell.description}</p>
          ) : Array.isArray(spell.description) ? (
            spell.description.map((paragraph, i) => (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>{paragraph}</p>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SpellCard;
