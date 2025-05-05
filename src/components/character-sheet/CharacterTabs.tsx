
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Swords, Sparkles, BookOpen, Map, FileQuestion, GripVertical } from "lucide-react";
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { HandbookTab } from './tabs/HandbookTab';
import { SpellsTab } from './tabs/SpellsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { BackstoryTab } from './tabs/BackstoryTab';
import { NotesTab } from './tabs/NotesTab';
import { CombatTab } from './tabs/CombatTab';
import { Character } from '@/types/character';

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  character: Character | null;
  onUpdate: (updates: any) => void;
  isDM?: boolean;
}

export const CharacterTabs: React.FC<CharacterTabsProps> = ({
  activeTab,
  setActiveTab,
  character,
  onUpdate,
  isDM = false
}) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4 w-full overflow-x-auto">
        <TabsTrigger value="abilities" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Хар-ки</span>
        </TabsTrigger>
        <TabsTrigger value="combat" className="flex items-center gap-2">
          <Swords className="h-4 w-4" />
          <span className="hidden sm:inline">Бой</span>
        </TabsTrigger>
        <TabsTrigger value="spells" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Магия</span>
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          <span className="hidden sm:inline">Инвентарь</span>
        </TabsTrigger>
        <TabsTrigger value="features" className="flex items-center gap-2">
          <FileQuestion className="h-4 w-4" />
          <span className="hidden sm:inline">Умения</span>
        </TabsTrigger>
        <TabsTrigger value="backstory" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">История</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Заметки</span>
        </TabsTrigger>
        <TabsTrigger value="handbook" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Справочник</span>
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
        <div className="p-4">
          <TabsContent value="abilities">
            <AbilitiesTab />
          </TabsContent>

          <TabsContent value="combat">
            <CombatTab />
          </TabsContent>

          <TabsContent value="spells">
            <SpellsTab 
              character={character} 
              onUpdate={onUpdate} 
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTab 
              character={character} 
              onUpdate={onUpdate} 
            />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesTab />
          </TabsContent>

          <TabsContent value="backstory">
            <BackstoryTab 
              character={character} 
              onUpdate={onUpdate} 
            />
          </TabsContent>

          <TabsContent value="notes">
            <NotesTab 
              character={character} 
              onUpdate={onUpdate} 
            />
          </TabsContent>

          <TabsContent value="handbook">
            <HandbookTab />
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );
};

export default CharacterTabs;
