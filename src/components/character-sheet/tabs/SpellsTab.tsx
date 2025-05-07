import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Book } from 'lucide-react';
import SpellPanel from '../SpellPanel';
import SpellSelectionModal from '../SpellSelectionModal';
import { convertToSpellData, getSpellcastingAbilityModifier } from '@/utils/spellUtils';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  
  // Группировка заклинаний по уровням
  const spellsByLevel: Record<number, CharacterSpell[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
  };
  
  if (character.spells && Array.isArray(character.spells)) {
    character.spells.forEach((spell) => {
      const spellObj: CharacterSpell = typeof spell === 'string' 
        ? { name: spell, level: 0 } 
        : spell;
      
      const level = spellObj.level || 0;
      if (!spellsByLevel[level]) {
        spellsByLevel[level] = [];
      }
      spellsByLevel[level].push(spellObj);
    });
  }
  
  // Обновленная функция для обновления заклинаний
  const handleSpellUpdate = (level: number, newSpells: CharacterSpell[]) => {
    // Convert any string spells to CharacterSpell objects
    const currentSpells = character.spells || [];
    const convertedCurrentSpells = currentSpells.map(spell => 
      typeof spell === 'string' ? { name: spell, level: 0 } as CharacterSpell : spell
    );
    
    // Remove spells of the specified level
    const updatedSpells = convertedCurrentSpells.filter(spell => 
      spell.level !== level
    );
    
    // Add the new spells
    updatedSpells.push(...newSpells);
    
    // Update the character
    onUpdate({ spells: updatedSpells });
  };
  
  const openSpellModal = () => {
    setIsSpellModalOpen(true);
  };
  
  const closeSpellModal = () => {
    setIsSpellModalOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Заклинания</h3>
        <Button onClick={openSpellModal}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить заклинание
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[65vh] pr-4">
            {/* Заговоры */}
            <SpellPanel 
              character={character}
              spells={spellsByLevel[0]} 
              onUpdate={(newSpells) => handleSpellUpdate(0, newSpells)} 
              level={0}
            />
            
            {/* Заклинания по уровням */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <SpellPanel
                key={level}
                character={character}
                spells={spellsByLevel[level] || []}
                onUpdate={(newSpells) => handleSpellUpdate(level, newSpells)}
                level={level}
              />
            ))}
            
            {/* Если нет заклинаний вообще */}
            {Object.values(spellsByLevel).every(arr => !arr.length) && (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="mx-auto h-8 w-8 mb-2" />
                <p>У персонажа нет заклинаний</p>
                <Button variant="outline" onClick={openSpellModal} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить заклинание
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="cantrips" className="space-y-4">
          <SpellPanel 
            character={character}
            spells={spellsByLevel[0]} 
            onUpdate={(newSpells) => handleSpellUpdate(0, newSpells)} 
            level={0}
          />
        </TabsContent>
        
        <TabsContent value="prepared" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>Функционал подготовки заклинаний в разработке.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Модальное окно для выбора заклинаний */}
      <SpellSelectionModal 
        isOpen={isSpellModalOpen} 
        onClose={closeSpellModal} 
        character={character} 
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default SpellsTab;
