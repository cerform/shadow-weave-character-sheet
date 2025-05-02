
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { SpellsTab } from './tabs/SpellsTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { HandbookTab } from './tabs/HandbookTab';

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CharacterTabs = ({ activeTab, setActiveTab }: CharacterTabsProps) => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="combat">Атаки</TabsTrigger>
          <TabsTrigger value="spells">Заклинания</TabsTrigger>
          <TabsTrigger value="features">Особенности</TabsTrigger>
          <TabsTrigger value="background">Предыстория</TabsTrigger>
          <TabsTrigger value="handbook">Справочник</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-240px)]">
          <TabsContent value="abilities" className="mt-0">
            <AbilitiesTab />
          </TabsContent>
          
          <TabsContent value="combat" className="mt-0">
            <CombatTab />
          </TabsContent>
          
          <TabsContent value="spells" className="mt-0">
            <SpellsTab />
          </TabsContent>
          
          <TabsContent value="features" className="mt-0">
            <FeaturesTab />
          </TabsContent>
          
          <TabsContent value="background" className="mt-0">
            <BackgroundTab />
          </TabsContent>
          
          <TabsContent value="handbook" className="mt-0">
            <HandbookTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
