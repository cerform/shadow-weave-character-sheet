
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
  // Helper function to handle material components display
  const renderComponents = () => {
    const components = [];
    if (spell.verbal) components.push(<Badge key="verbal" variant="outline" className="mr-1">В</Badge>);
    if (spell.somatic) components.push(<Badge key="somatic" variant="outline" className="mr-1">С</Badge>);
    if (spell.material) components.push(<Badge key="material" variant="outline">М</Badge>);
    
    // If no specific component flags, show generic components
    if (components.length === 0 && spell.components) {
      return <span>{spell.components}</span>;
    }
    
    return <div>{components}</div>;
  };
  
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
        {renderComponents()}
      </div>
      
      {spell.duration && (
        <div className="flex justify-between mb-1">
          <span className="font-medium">Длительность:</span>
          <span>{spell.duration}</span>
        </div>
      )}
      
      {spell.ritual && (
        <div className="mb-1">
          <Badge variant="secondary" className="mr-1">Ритуал</Badge>
        </div>
      )}
      
      {spell.concentration && (
        <div className="mb-1">
          <Badge variant="secondary" className="mr-1">Концентрация</Badge>
        </div>
      )}
      
      {spell.description && (
        <div className="mt-2 text-sm border-t pt-2" style={{ borderColor: `${currentTheme.borderColor || currentTheme.accent}40` }}>
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
