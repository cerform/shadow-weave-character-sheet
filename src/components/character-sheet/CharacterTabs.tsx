
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { SpellsTab } from './tabs/SpellsTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { HandbookTab } from './tabs/HandbookTab';
import { PlayerHandbookTab } from './tabs/PlayerHandbookTab';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CharacterTabs = ({ activeTab, setActiveTab }: CharacterTabsProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 gap-2">
          <TabsTrigger value="abilities" className="text-sm py-2">Характеристики</TabsTrigger>
          <TabsTrigger value="combat" className="text-sm py-2">Атаки</TabsTrigger>
          <TabsTrigger value="spells" className="text-sm py-2">Заклинания</TabsTrigger>
          <TabsTrigger value="features" className="text-sm py-2">Особенности</TabsTrigger>
          <TabsTrigger value="background" className="text-sm py-2">Предыстория</TabsTrigger>
          <TabsTrigger value="handbook" className="text-sm py-2">Справочник</TabsTrigger>
          <TabsTrigger value="playerhandbook" className="text-sm py-2 col-span-full">Руководство игрока</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
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
          
          <TabsContent value="playerhandbook" className="mt-0">
            <PlayerHandbookTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
