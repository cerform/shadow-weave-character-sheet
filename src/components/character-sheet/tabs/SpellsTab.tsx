
import React, { useContext } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterContext } from "@/contexts/CharacterContext";
import { SPELL_DETAILS } from "@/data/spells";

export const SpellsTab = () => {
  const { character } = useContext(CharacterContext);
  
  // Group spells by level
  const spellsByLevel = character?.spells?.reduce((acc: {[key: string]: string[]}, spell: string) => {
    const level = SPELL_DETAILS[spell]?.level || 1;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(spell);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Заклинания</h3>
      
      <div className="bg-primary/5 rounded-lg p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
        {Object.entries(character?.spellSlots || {}).map(([level, slot]: [string, any]) => (
          <div key={level}>
            <div className="text-xs text-muted-foreground">{level} круг</div>
            <div className="font-bold">{slot.max - slot.used}/{slot.max}</div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Заговоры</h4>
          <div className="space-y-2">
            {(spellsByLevel[0] || []).map((spell: string) => (
              <div key={spell} className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                <h5 className="font-medium">{spell}</h5>
                <p className="text-sm text-muted-foreground">
                  {SPELL_DETAILS[spell]?.range ? `Дистанция: ${SPELL_DETAILS[spell]?.range}, ` : ''}
                  {SPELL_DETAILS[spell]?.duration ? `Длительность: ${SPELL_DETAILS[spell]?.duration}` : ''}
                </p>
              </div>
            ))}
            {character.spells && character.spells.length > 0 && !spellsByLevel[0] && (
              <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                <h5 className="font-medium">Луч холода</h5>
                <p className="text-sm text-muted-foreground">Дистанция: 60 футов, Длительность: Мгновенная</p>
              </div>
            )}
          </div>
        </div>
        
        {[1, 2, 3].map(level => (
          spellsByLevel[level] || level <= 3 ? (
            <div key={level}>
              <h4 className="font-medium mb-2">{level} круг</h4>
              <div className="space-y-2">
                {(spellsByLevel[level] || []).map((spell: string) => (
                  <div key={spell} className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">{spell}</h5>
                    <p className="text-sm text-muted-foreground">
                      {SPELL_DETAILS[spell]?.range ? `Дистанция: ${SPELL_DETAILS[spell]?.range}, ` : ''}
                      {SPELL_DETAILS[spell]?.duration ? `Длительность: ${SPELL_DETAILS[spell]?.duration}` : ''}
                    </p>
                  </div>
                ))}
                {(!spellsByLevel[level] && level === 1) && (
                  <div className="p-2 bg-primary/5 rounded-md hover:bg-primary/10 cursor-pointer">
                    <h5 className="font-medium">Волшебная стрела</h5>
                    <p className="text-sm text-muted-foreground">Дистанция: 120 футов, Длительность: Мгновенная</p>
                  </div>
                )}
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};
