import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SpellPanel from './SpellPanel';
import { CharacterSpell } from '@/types/character';
import { convertToSpellData, getSpellcastingAbilityModifier } from '@/utils/spellUtils';
import { SpellData } from '@/types/spells';
import SpellSelectionModal from './SpellSelectionModal';
import SpellDialog from './SpellDialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface CharacterSpellsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterSpells: React.FC<CharacterSpellsProps> = ({ character, onUpdate }) => {
  const [isSpellSelectionOpen, setIsSpellSelectionOpen] = useState(false);
  
  const handleOpenSpellSelection = () => {
    setIsSpellSelectionOpen(true);
  };
  
  const handleCloseSpellSelection = () => {
    setIsSpellSelectionOpen(false);
  };
  
  const handleSpellUpdate = (updatedSpells: CharacterSpell[]) => {
    onUpdate({ spells: updatedSpells });
  };
  
  // Group spells by level
  const cantrips = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 0;
  }) || [];
  
  const level1Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 1;
  }) || [];
  
  const level2Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 2;
  }) || [];
  
  const level3Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 3;
  }) || [];
  
  const level4Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 4;
  }) || [];
  
  const level5Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 5;
  }) || [];
  
  const level6Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 6;
  }) || [];
  
  const level7Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 7;
  }) || [];
  
  const level8Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 8;
  }) || [];
  
  const level9Spells = character.spells?.filter(spell => {
    const spellData = convertToSpellData(spell);
    return spellData.level === 9;
  }) || [];
  
  return (
    <div className="space-y-4">
      <SpellCastingPanel character={character} />
      
      <Tabs defaultValue="cantrips">
        <TabsList className="bg-secondary/70 rounded-md p-1 flex justify-between">
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="level1">1 уровень</TabsTrigger>
          <TabsTrigger value="level2">2 уровень</TabsTrigger>
          <TabsTrigger value="level3">3 уровень</TabsTrigger>
          <TabsTrigger value="level4">4 уровень</TabsTrigger>
          <TabsTrigger value="level5">5 уровень</TabsTrigger>
          <TabsTrigger value="level6">6 уровень</TabsTrigger>
          <TabsTrigger value="level7">7 уровень</TabsTrigger>
          <TabsTrigger value="level8">8 уровень</TabsTrigger>
          <TabsTrigger value="level9">9 уровень</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cantrips">
          <SpellPanel 
            character={character}
            spells={cantrips}
            onUpdate={handleSpellUpdate}
            level={0}
          />
        </TabsContent>
        
        <TabsContent value="level1">
          <SpellPanel 
            character={character}
            spells={level1Spells}
            onUpdate={handleSpellUpdate}
            level={1}
          />
        </TabsContent>
        
        <TabsContent value="level2">
          <SpellPanel 
            character={character}
            spells={level2Spells}
            onUpdate={handleSpellUpdate}
            level={2}
          />
        </TabsContent>
        
        <TabsContent value="level3">
          <SpellPanel 
            character={character}
            spells={level3Spells}
            onUpdate={handleSpellUpdate}
            level={3}
          />
        </TabsContent>
        
        <TabsContent value="level4">
          <SpellPanel 
            character={character}
            spells={level4Spells}
            onUpdate={handleSpellUpdate}
            level={4}
          />
        </TabsContent>
        
        <TabsContent value="level5">
          <SpellPanel 
            character={character}
            spells={level5Spells}
            onUpdate={handleSpellUpdate}
            level={5}
          />
        </TabsContent>
        
        <TabsContent value="level6">
          <SpellPanel 
            character={character}
            spells={level6Spells}
            onUpdate={handleSpellUpdate}
            level={6}
          />
        </TabsContent>
        
        <TabsContent value="level7">
          <SpellPanel 
            character={character}
            spells={level7Spells}
            onUpdate={handleSpellUpdate}
            level={7}
          />
        </TabsContent>
        
        <TabsContent value="level8">
          <SpellPanel 
            character={character}
            spells={level8Spells}
            onUpdate={handleSpellUpdate}
            level={8}
          />
        </TabsContent>
        
        <TabsContent value="level9">
          <SpellPanel 
            character={character}
            spells={level9Spells}
            onUpdate={handleSpellUpdate}
            level={9}
          />
        </TabsContent>
      </Tabs>
      
      <Button variant="outline" className="w-full" onClick={handleOpenSpellSelection}>
        <PlusIcon className="h-4 w-4 mr-2" />
        Изменить заклинания
      </Button>
      
      <SpellSelectionModal
        isOpen={isSpellSelectionOpen}
        onClose={handleCloseSpellSelection}
        character={character}
        onUpdate={handleSpellUpdate}
      />
    </div>
  );
};

export default CharacterSpells;
