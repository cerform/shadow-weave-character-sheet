import React from 'react';
import { SpellData } from '@/types/spells';

interface SpellDescriptionProps {
  spell: SpellData;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({ spell }) => {
  return (
    <div className="space-y-2">
      <div>
        <h4 className="font-semibold">Описание:</h4>
        {Array.isArray(spell.description) ? (
          spell.description.map((desc, index) => (
            <p key={index} className="text-sm">{desc}</p>
          ))
        ) : (
          <p className="text-sm">{spell.description}</p>
        )}
      </div>
      
      {spell.higherLevels && (
        <div className="mt-2">
          <h4 className="font-semibold">На более высоких уровнях:</h4>
          <p className="text-sm">{spell.higherLevels}</p>
        </div>
      )}
    </div>
  );
};

export default SpellDescription;
