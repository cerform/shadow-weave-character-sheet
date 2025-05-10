
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { normalizeSpells, convertToSpellData } from '@/utils/spellUtils';

interface SpellsProps {
  className?: string;
}

export function CharacterSpells({ className }: SpellsProps) {
  const { character, updateCharacter } = useCharacter();
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, SpellData[]>>({});
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Process spells whenever character changes
  useEffect(() => {
    if (!character) return;

    // Use the normalizeSpells utility function to ensure all spells have correct types
    const normalizedSpells = normalizeSpells(character);
    
    // Convert CharacterSpell[] to SpellData[] for consistency
    const spellDataList = normalizedSpells.map(spell => convertToSpellData(spell));
    
    // Group by level
    const grouped = spellDataList.reduce((acc, spell) => {
      const level = spell.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {} as Record<number, SpellData[]>);

    setSpellsByLevel(grouped);
  }, [character]);
  
  // Handle spell click to show details
  const handleSpellClick = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  // Toggle spell prepared status
  const togglePreparedStatus = (spellId: string) => {
    if (!character || !character.spells) return;

    const updatedSpells = character.spells.map(spell => {
      if (typeof spell === 'string') {
        return {
          id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
          name: spell,
          level: 0,
          school: 'Универсальная',
          prepared: false
        };
      }
      
      if (spell.id === spellId) {
        return { ...spell, prepared: !spell.prepared };
      }
      
      return spell;
    });

    updateCharacter({ spells: updatedSpells });
  };

  // Open spell selection modal
  const openSpellModal = () => {
    setIsModalOpen(true);
  };

  // Render each level's spells
  const renderSpellLevel = (level: number, spells: SpellData[]) => {
    const levelName = level === 0 ? 'Заговоры' : `${level} уровень`;

    return (
      <div key={`level-${level}`} className="mb-4">
        <h3 className="text-lg font-semibold">{levelName}</h3>
        <div className="space-y-1">
          {spells.map(spell => (
            <div
              key={spell.id}
              className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-secondary/10"
              onClick={() => handleSpellClick(spell)}
            >
              <span>{spell.name}</span>
              <input
                type="checkbox"
                checked={spell.prepared}
                onChange={(e) => {
                  e.stopPropagation();
                  togglePreparedStatus(spell.id);
                }}
                className="ml-2"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get spells to show based on search or all spells
  const getSpellsToShow = () => {
    if (searchTerm.trim() === '') {
      // Show all spells grouped by level
      return Object.entries(spellsByLevel)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, spells]) => renderSpellLevel(Number(level), spells));
    } else {
      // Show filtered spells
      const allSpells = Object.values(spellsByLevel).flat();
      const filtered = allSpells.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filtered.length === 0) {
        return <p className="text-center py-4">Заклинания не найдены</p>;
      }
      
      return renderSpellLevel(99, filtered); // Use a dummy level number
    }
  };

  if (!character) return null;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Заклинания</h2>
        <div className="space-x-2">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 border rounded"
          />
          <button
            onClick={openSpellModal}
            className="px-3 py-1 bg-primary text-white rounded"
          >
            Добавить
          </button>
        </div>
      </div>
      
      {getSpellsToShow()}
      
      {/* Spell Modal would be rendered here */}
      {selectedSpell && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded max-w-lg w-full">
            <h3 className="text-xl font-bold">{selectedSpell.name}</h3>
            <p>{selectedSpell.description}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-3 py-1 bg-primary text-white rounded"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSpells;
