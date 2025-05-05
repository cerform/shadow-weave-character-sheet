
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Character } from '@/types/character';

// Components for each tab
import AbilitiesTab from './tabs/AbilitiesTab';
import CombatTab from './tabs/CombatTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import SpellsTab from './tabs/SpellsTab';
import FeaturesTab from './tabs/FeaturesTab';
import BackgroundTab from './tabs/BackgroundTab';
import NotesTab from './tabs/NotesTab';
import { HandbookTab } from './tabs/HandbookTab';

export interface CharacterTabsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Создадим типы для табов, чтобы исправить ошибки
export interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export interface NotesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ 
  character,
  onUpdate
}) => {
  // Define tab data
  const tabs = [
    { id: 'abilities', label: 'Характеристики' },
    { id: 'combat', label: 'Бой' },
    { id: 'equipment', label: 'Снаряжение' },
    { id: 'spells', label: 'Заклинания' },
    { id: 'features', label: 'Особенности' },
    { id: 'background', label: 'Предыстория' },
    { id: 'notes', label: 'Заметки' },
    { id: 'handbook', label: 'Справочник' }
  ];

  // Helper function to safely render equipment
  const renderEquipment = () => {
    if (!character.equipment) return [];
    
    // Handle different equipment formats
    if (Array.isArray(character.equipment)) {
      return character.equipment;
    }
    
    // Handle object format
    if (typeof character.equipment === 'object') {
      const equipment: string[] = [];
      
      // Add weapons if they exist
      if (character.equipment.weapons && Array.isArray(character.equipment.weapons)) {
        equipment.push(...character.equipment.weapons);
      }
      
      // Add armor if it exists
      if (character.equipment.armor && typeof character.equipment.armor === 'string') {
        equipment.push(character.equipment.armor);
      }
      
      // Add other items if they exist
      if (character.equipment.items && Array.isArray(character.equipment.items)) {
        equipment.push(...character.equipment.items);
      }
      
      return equipment;
    }
    
    return [];
  };

  return (
    <Card>
      <Tabs defaultValue="abilities" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="text-xs md:text-sm font-medium transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="abilities">
          <AbilitiesTab character={character} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="combat">
          <CombatTab character={character} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="equipment">
          <EquipmentTab 
            character={character} 
            equipment={renderEquipment()}
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="spells">
          <SpellsTab character={character} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="features">
          <FeaturesTab 
            character={character} 
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="background">
          <BackgroundTab character={character} onUpdate={onUpdate} />
        </TabsContent>
        
        <TabsContent value="notes">
          <NotesTab 
            character={character} 
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="handbook">
          <HandbookTab character={character} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CharacterTabs;
