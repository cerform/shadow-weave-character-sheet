
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Character } from '@/types/character';
import AbilitiesTab from './tabs/AbilitiesTab';
import SpellsTab from './tabs/SpellsTab';
import InventoryTab from './tabs/InventoryTab';
import NotesTab from './tabs/NotesTab';
import BackgroundTab from './tabs/BackgroundTab';
import FeatsTab from './tabs/FeatsTab';

interface CharacterTabsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ character, onUpdate }) => {
  return (
    <Tabs defaultValue="abilities" className="w-full">
      <TabsList className="grid grid-cols-6">
        <TabsTrigger value="abilities">Характеристики</TabsTrigger>
        <TabsTrigger value="spells">Заклинания</TabsTrigger>
        <TabsTrigger value="inventory">Инвентарь</TabsTrigger>
        <TabsTrigger value="feats">Умения</TabsTrigger>
        <TabsTrigger value="background">Предыстория</TabsTrigger>
        <TabsTrigger value="notes">Заметки</TabsTrigger>
      </TabsList>
      
      <TabsContent value="abilities">
        <AbilitiesTab character={character} onUpdateCharacter={onUpdate} />
      </TabsContent>
      
      <TabsContent value="spells">
        <SpellsTab character={character} onUpdateCharacter={onUpdate} />
      </TabsContent>
      
      <TabsContent value="inventory">
        <InventoryTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="feats">
        <FeatsTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="background">
        <BackgroundTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="notes">
        <NotesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
