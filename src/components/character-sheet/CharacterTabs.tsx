
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AbilitiesTab from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import FeatsTab from './tabs/FeatsTab';
import { HandbookTab } from './tabs/HandbookTab';
import NotesTab from './tabs/NotesTab';
import BackgroundTab from './tabs/BackgroundTab';
import { SpellsTab } from './tabs/SpellsTab';
import { Character } from '@/types/character';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CharacterTabsProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ 
  character, 
  onUpdate = () => {} 
}) => {
  return (
    <Tabs defaultValue="abilities" className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-9 mb-4">
        <TabsTrigger value="abilities">Способности</TabsTrigger>
        <TabsTrigger value="combat">Бой</TabsTrigger>
        <TabsTrigger value="spells">Заклинания</TabsTrigger>
        <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
        <TabsTrigger value="features">Умения</TabsTrigger>
        <TabsTrigger value="feats">Черты</TabsTrigger>
        <TabsTrigger value="background">Предыстория</TabsTrigger>
        <TabsTrigger value="notes">Заметки</TabsTrigger>
        <TabsTrigger value="handbook">Справочник</TabsTrigger>
      </TabsList>
      
      <TabsContent value="abilities">
        <AbilitiesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="combat">
        <CombatTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="spells">
        <SpellsTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="equipment">
        <EquipmentTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="features">
        <FeaturesTab character={character} onUpdate={onUpdate} />
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
      
      <TabsContent value="handbook">
        <HandbookTab character={character} />
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
