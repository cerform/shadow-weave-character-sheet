
// Fixed SpellBookViewer.tsx with corrected type usage
import React from 'react';
import { SpellData, CharacterSpell } from '@/types/spells';

interface SpellBookViewerProps {
  spells: SpellData[];
  onClose: () => void;
  onAddSpell: (spell: SpellData) => void;
  characterSpells: CharacterSpell[];
}

interface SpellCardProps {
  spell: SpellData;
  onAddSpell: (spell: SpellData) => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onAddSpell }) => {
  return (
    <div className="border rounded p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold">{spell.name}</h3>
      <p className="text-sm text-gray-500">{spell.level} уровень, {spell.school}</p>
      <button
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => onAddSpell(spell)}
      >
        Добавить в книгу
      </button>
    </div>
  );
};

export const SpellBookViewer: React.FC<SpellBookViewerProps> = ({ spells, onClose, onAddSpell, characterSpells }) => {
  // Преобразуем CharacterSpell[] в SpellData[]
  const spellsData: SpellData[] = characterSpells.map(spell => ({
    id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    prepared: !!spell.prepared,
    materials: spell.materials || '',
    higherLevel: spell.higherLevel || '',
    higherLevels: spell.higherLevels || '',
    source: spell.source || ''
  }));
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Доступные заклинания
          </h3>
          <div className="mt-2 px-7 py-3">
            {spellsData.map(spell => (
              <SpellCard key={spell.id} spell={spell} onAddSpell={onAddSpell} />
            ))}
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
