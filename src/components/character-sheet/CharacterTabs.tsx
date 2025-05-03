
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
import { Sword, Wand, BookOpen, User, GraduationCap, Book, ScrollText } from "lucide-react";
import { useCharacter } from '@/contexts/CharacterContext';

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
  const { character } = useCharacter();
  
  // Словарь русских названий характеристик
  const abilityNames = {
    STR: "Сила",
    DEX: "Ловкость",
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость",
    CHA: "Харизма"
  };
  
  return (
    <Card 
      className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1 mt-2"
      style={{ 
        backgroundColor: `${currentTheme.cardBackground || 'rgba(20, 20, 30, 0.7)'}`,
        boxShadow: `0 0 10px ${currentTheme.accent}40`,
        borderColor: `${currentTheme.accent}30`
      }}
    >
      {/* Блок с характеристиками вверху */}
      <div className="mb-6 pb-4 border-b" style={{ borderColor: `${currentTheme.accent}30` }}>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(character?.abilities || {}).map(([key, value]) => {
            const abilityKey = key as keyof typeof abilityNames;
            const modifier = getModifier(value);
            const isPositive = !modifier.includes('-');
            
            return (
              <div 
                key={key} 
                className="p-3 rounded-lg text-center border shadow-md"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  borderColor: `${currentTheme.accent}40`,
                  boxShadow: `inset 0 0 8px ${currentTheme.accent}30`
                }}
              >
                <div 
                  className="text-sm font-medium mb-1"
                  style={{ 
                    color: currentTheme.textColor,
                    textShadow: `0 0 2px rgba(0,0,0,0.8)` 
                  }}
                >
                  {abilityNames[abilityKey]}
                </div>
                <div 
                  className="text-2xl font-bold my-1"
                  style={{ 
                    color: currentTheme.textColor,
                    textShadow: `0 0 3px rgba(0,0,0,0.8), 0 0 5px ${currentTheme.accent}60`
                  }}
                >
                  {value}
                </div>
                <div 
                  className="text-md font-bold"
                  style={{ 
                    color: isPositive ? '#4ade80' : '#f87171',
                    textShadow: `0 0 3px rgba(0,0,0,0.8), 0 0 5px ${isPositive ? '#4ade8060' : '#f8717160'}`
                  }}
                >
                  {modifier}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} mb-6 gap-2`}>
          <TabsTrigger 
            value="abilities" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'abilities' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'abilities' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'abilities' ? currentTheme.accent : 'transparent'
            }}
          >
            <User className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Характерис.</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="combat" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'combat' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'combat' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'combat' ? currentTheme.accent : 'transparent'
            }}
          >
            <Sword className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Атаки</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="spells" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'spells' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'spells' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'spells' ? currentTheme.accent : 'transparent'
            }}
          >
            <Wand className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Заклинания</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="features" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'features' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'features' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'features' ? currentTheme.accent : 'transparent'
            }}
          >
            <GraduationCap className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Особенности</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="background" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'background' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'background' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'background' ? currentTheme.accent : 'transparent'
            }}
          >
            <ScrollText className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Предыстор.</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="handbook" 
            className="text-xs py-2 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'handbook' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'handbook' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'handbook' ? currentTheme.accent : 'transparent'
            }}
          >
            <Book className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Справочник</span>}
          </TabsTrigger>
          
          <TabsTrigger 
            value="playerhandbook" 
            className="text-xs py-2 flex items-center justify-center gap-1 col-span-full mt-1"
            style={{
              backgroundColor: activeTab === 'playerhandbook' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'playerhandbook' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'playerhandbook' ? currentTheme.accent : 'transparent'
            }}
          >
            <BookOpen className={`${isMobile ? "size-4" : "size-3"}`} />
            {!isMobile && <span className="truncate">Руководство игрока</span>}
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-460px)]' : 'h-[calc(100vh-440px)]'} overflow-y-auto pr-2`}>
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

// Расчет модификатора из значения характеристики
const getModifier = (score: number) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
