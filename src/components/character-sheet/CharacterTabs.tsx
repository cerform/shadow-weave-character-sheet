
// CharacterTabs.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Character } from '@/types/character';
import AbilitiesTab from './tabs/AbilitiesTab';
import CombatTab from './tabs/CombatTab';
import SpellsTab from './tabs/SpellsTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import NotesTab from './tabs/NotesTab';

interface CharacterTabsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ character, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('abilities');

  // Обработчик изменения вкладки
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs defaultValue="abilities" value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <TabsTrigger value="abilities">Характеристики</TabsTrigger>
        <TabsTrigger value="combat">Бой</TabsTrigger>
        <TabsTrigger value="spells">Заклинания</TabsTrigger>
        <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
        <TabsTrigger value="features">Особенности</TabsTrigger>
        <TabsTrigger value="notes">Заметки</TabsTrigger>
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
      <TabsContent value="notes">
        <NotesTab character={character} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
