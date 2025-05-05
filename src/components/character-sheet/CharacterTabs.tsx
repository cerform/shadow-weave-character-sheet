
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  ScrollText, 
  FileText, 
  Package, 
  Heart,
  Dices,
  User,
  Notebook
} from "lucide-react";
import FeaturesTab from "./tabs/FeaturesTab";
import SpellsTab from "./tabs/SpellsTab";
import NotesTab from "./tabs/NotesTab";
import InventoryTab from "./tabs/InventoryTab";
import CombatTab from "./tabs/CombatTab";
import GeneralTab from "./tabs/GeneralTab";
import { Character } from '@/types/character';

interface CharacterTabsProps {
  character: Character | null;
  isDM?: boolean;
}

const CharacterTabs = ({ character, isDM = false }: CharacterTabsProps) => {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
        <TabsTrigger value="general" className="flex flex-col items-center gap-1">
          <User className="h-4 w-4" />
          <span className="text-xs">Основное</span>
        </TabsTrigger>
        
        <TabsTrigger value="combat" className="flex flex-col items-center gap-1">
          <Heart className="h-4 w-4" />
          <span className="text-xs">Бой</span>
        </TabsTrigger>
        
        <TabsTrigger value="features" className="flex flex-col items-center gap-1">
          <ScrollText className="h-4 w-4" />
          <span className="text-xs">Умения</span>
        </TabsTrigger>
        
        <TabsTrigger value="spells" className="flex flex-col items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs">Заклинания</span>
        </TabsTrigger>
        
        <TabsTrigger value="inventory" className="flex flex-col items-center gap-1">
          <Package className="h-4 w-4" />
          <span className="text-xs">Инвентарь</span>
        </TabsTrigger>
        
        <TabsTrigger value="notes" className="flex flex-col items-center gap-1">
          <Notebook className="h-4 w-4" />
          <span className="text-xs">Заметки</span>
        </TabsTrigger>
        
        <TabsTrigger value="dice" className="flex flex-col items-center gap-1">
          <Dices className="h-4 w-4" />
          <span className="text-xs">Кубики</span>
        </TabsTrigger>
        
        <TabsTrigger value="details" className="flex flex-col items-center gap-1">
          <FileText className="h-4 w-4" />
          <span className="text-xs">Детали</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralTab character={character} />
      </TabsContent>
      
      <TabsContent value="combat">
        <CombatTab character={character} />
      </TabsContent>
      
      <TabsContent value="features">
        <FeaturesTab character={character} />
      </TabsContent>
      
      <TabsContent value="spells">
        <SpellsTab character={character} />
      </TabsContent>
      
      <TabsContent value="inventory">
        <InventoryTab character={character} />
      </TabsContent>
      
      <TabsContent value="notes">
        <NotesTab character={character} />
      </TabsContent>
      
      <TabsContent value="dice">
        <div className="p-4 bg-card/30 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Кубики</h3>
          {/* Dice roller will be added here */}
        </div>
      </TabsContent>
      
      <TabsContent value="details">
        <div className="p-4 bg-card/30 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Детали персонажа</h3>
          {/* Character details will be added here */}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CharacterTabs;
