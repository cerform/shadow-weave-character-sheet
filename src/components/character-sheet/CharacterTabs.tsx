
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpellsTab } from './tabs/SpellsTab';
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { NotesTab } from './tabs/NotesTab';
import { HandbookTab } from './tabs/HandbookTab';

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  character?: any; // Add these props to be passed to children
  onUpdate?: (updates: any) => void; 
}

export const CharacterTabs = ({ activeTab, setActiveTab, character, onUpdate }: CharacterTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full mb-4 bg-zinc-800/40">
        <TabsTrigger value="abilities">Характеристики</TabsTrigger>
        <TabsTrigger value="combat">Бой</TabsTrigger>
        <TabsTrigger value="spells">Заклинания</TabsTrigger>
        <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
        <TabsTrigger value="features">Особенности</TabsTrigger>
        <TabsTrigger value="background">Предыстория</TabsTrigger>
        <TabsTrigger value="notes">Заметки</TabsTrigger>
      </TabsList>
      
      <TabsContent value="abilities" className="focus-visible:outline-none">
        <AbilitiesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="combat" className="focus-visible:outline-none">
        <CombatTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="spells" className="focus-visible:outline-none">
        <SpellsTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="equipment" className="focus-visible:outline-none">
        <EquipmentTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="features" className="focus-visible:outline-none">
        <FeaturesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="background" className="focus-visible:outline-none">
        <BackgroundTab character={character} onUpdate={onUpdate} />
      </TabsContent>
      
      <TabsContent value="notes" className="focus-visible:outline-none">
        <NotesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  );
};
