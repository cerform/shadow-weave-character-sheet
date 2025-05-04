
import React, { useState } from 'react';
import useSpellbook from '@/hooks/spellbook';
import { SpellData } from '@/hooks/spellbook/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { spells as allSpells } from '@/data/spells';

const SpellBookViewer = () => {
  const { 
    filteredSpells, 
    searchTerm, 
    setSearchTerm,
    getSchoolBadgeColor,
    getBadgeColor,
    formatClasses
  } = useSpellbook();
  
  const [spellsData, setSpellsData] = useState<SpellData[]>(
    allSpells.map(spell => ({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Unknown',
      castingTime: spell.castingTime || '',
      range: spell.range || '',
      components: spell.components || '',
      duration: spell.duration || '',
      description: spell.description || '',
      classes: spell.classes || [],
      isRitual: spell.ritual || false,
      isConcentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      higherLevel: spell.higherLevels || ''
    }))
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Книга заклинаний</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpells.map((spell) => (
          <Card key={spell.id || spell.name} className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">{spell.name}</h3>
              <Badge variant="outline" className="ml-2">
                {spell.level === 0 ? "Заговор" : `${spell.level} ур.`}
              </Badge>
            </div>
            <div className="mt-2">
              <p className="text-sm">{spell.school}</p>
              <p className="text-sm mt-2">{spell.description?.substring(0, 100)}...</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpellBookViewer;
