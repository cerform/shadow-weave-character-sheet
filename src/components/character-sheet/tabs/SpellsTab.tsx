
import React, { useEffect, useState } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpellCastingPanel from '../SpellCastingPanel';
import SpellPanel from '../SpellPanel';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Update SpellCastingPanel props interface
interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Update SpellPanel props interface
interface SpellPanelProps {
  character: Character;
  spells: (string | CharacterSpell)[];
  onUpdate: (newSpells: any) => void;
  level: number;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  // Состояние для управления активной вкладкой
  const [activeTab, setActiveTab] = useState('cantrips');

  // Функция для обновления заклинаний
  const updateSpells = (newSpells: any) => {
    onUpdate({ spells: newSpells });
  };

  // Получение заклинаний для конкретного уровня
  const getSpellsByLevel = (level: number | 'cantrips') => {
    if (!character.spells || !Array.isArray(character.spells)) return [];
    
    if (level === 'cantrips') {
      return character.spells.filter(spell => 
        typeof spell === 'object' && spell.level === 0
      );
    }
    
    return character.spells.filter(spell => 
      typeof spell === 'object' && spell.level === level
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Заклинания</h2>

        {/* Панель информации о заклинаниях */}
        <SpellCastingPanel
          character={character}
          onUpdate={onUpdate}
        />

        {/* Вкладки для кантипов и заклинаний по уровням */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="cantrips">Кантрипы</TabsTrigger>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <TabsTrigger key={level} value={`level-${level}`}>
                {level} уровень
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Содержимое вкладок */}
          <TabsContent value="cantrips" className="mt-2">
            <SpellPanel
              character={character}
              spells={getSpellsByLevel('cantrips')}
              onUpdate={updateSpells}
              level={0}
            />
          </TabsContent>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
            <TabsContent key={level} value={`level-${level}`} className="mt-2">
              <SpellPanel
                character={character}
                spells={getSpellsByLevel(level)}
                onUpdate={updateSpells}
                level={level}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpellsTab;
