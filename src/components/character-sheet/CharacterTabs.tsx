import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { SpellsTab } from './tabs/SpellsTab';
import { NotesTab } from './tabs/NotesTab';
import { BackgroundTab } from './tabs/BackgroundTab';

// Importing any other tabs you have
import { Character } from '@/types/character';

interface CharacterTabsProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  activeTab: string;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ character, updateCharacter, activeTab }) => {
  
  return (
    <Tabs defaultValue={activeTab} className="w-full">
      <TabsContent value="abilities" className="mt-0">
        <AbilitiesTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="combat" className="mt-0">
        <CombatTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="equipment" className="mt-0">
        <EquipmentTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="features" className="mt-0">
        <FeaturesTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="spells" className="mt-0">
        <SpellsTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-0">
        <NotesTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
      
      <TabsContent value="background" className="mt-0">
        <BackgroundTab character={character} onUpdate={updateCharacter} />
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
