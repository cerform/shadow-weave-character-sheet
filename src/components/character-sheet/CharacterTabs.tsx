
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
import { useDeviceType } from "@/hooks/use-mobile";
import { Sword, Wand, BookOpen, User, GraduationCap, Book } from "lucide-react";

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CharacterTabs = ({ activeTab, setActiveTab }: CharacterTabsProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  return (
    <Card 
      className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1"
      style={{ 
        backgroundColor: `${currentTheme.cardBackground || 'rgba(20, 20, 30, 0.7)'}`,
        boxShadow: `0 0 10px ${currentTheme.accent}40`,
        borderColor: `${currentTheme.accent}30`
      }}
    >
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} mb-6 gap-2`}>
          <TabsTrigger 
            value="abilities" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'abilities' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'abilities' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <User className="size-3" />
            {!isMobile && "Характерис."}
          </TabsTrigger>
          
          <TabsTrigger 
            value="combat" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'combat' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'combat' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <Sword className="size-3" />
            {!isMobile && "Атаки"}
          </TabsTrigger>
          
          <TabsTrigger 
            value="spells" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'spells' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'spells' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <Wand className="size-3" />
            {!isMobile && "Заклинания"}
          </TabsTrigger>
          
          <TabsTrigger 
            value="features" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'features' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'features' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <GraduationCap className="size-3" />
            {!isMobile && "Особенности"}
          </TabsTrigger>
          
          <TabsTrigger 
            value="background" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'background' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'background' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <User className="size-3" />
            {!isMobile && "Предыстор."}
          </TabsTrigger>
          
          <TabsTrigger 
            value="handbook" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'handbook' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'handbook' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <Book className="size-3" />
            {!isMobile && "Справочник"}
          </TabsTrigger>
          
          <TabsTrigger 
            value="playerhandbook" 
            className="text-xs py-2 flex items-center justify-center gap-1 col-span-full"
            style={{
              backgroundColor: activeTab === 'playerhandbook' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'playerhandbook' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none'
            }}
          >
            <BookOpen className="size-3" />
            {!isMobile && "Руководство игрока"}
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-300px)]' : 'h-[calc(100vh-280px)]'}`}>
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
