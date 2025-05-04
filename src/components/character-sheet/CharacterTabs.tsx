
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AbilitiesTab } from './tabs/AbilitiesTab';
import { CombatTab } from './tabs/CombatTab';
import { SpellsTab } from './tabs/SpellsTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { HandbookTab } from './tabs/HandbookTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Activity, Sword, BookOpen, Sparkles, ScrollText, Shield } from "lucide-react";

interface CharacterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CharacterTabs = ({ activeTab, setActiveTab }: CharacterTabsProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div className="mb-8 mt-4">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-6 sm:grid-cols-6">
          <TabsTrigger 
            value="abilities"
            style={{
              color: activeTab === "abilities" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "abilities" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Характеристики"
          >
            <Shield className="h-5 w-5" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="combat"
            style={{
              color: activeTab === "combat" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "combat" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Атаки"
          >
            <Sword className="h-5 w-5" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="spells"
            style={{
              color: activeTab === "spells" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "spells" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Заклинания"
          >
            <Sparkles className="h-5 w-5" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="features"
            style={{
              color: activeTab === "features" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "features" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Особенности"
          >
            <Activity className="h-5 w-5" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="background"
            style={{
              color: activeTab === "background" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "background" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Предыстория"
          >
            <ScrollText className="h-5 w-5" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="handbook"
            style={{
              color: activeTab === "handbook" ? currentTheme.textColor : currentTheme.mutedTextColor,
              backgroundColor: activeTab === "handbook" ? `${currentTheme.accent}20` : "transparent"
            }}
            title="Справочник"
          >
            <BookOpen className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <div className="border-t border-primary/20 pt-4 mt-1" />

        <TabsContent value="abilities">
          <AbilitiesTab />
        </TabsContent>
        
        <TabsContent value="combat">
          <CombatTab />
        </TabsContent>
        
        <TabsContent value="spells">
          <SpellsTab />
        </TabsContent>
        
        <TabsContent value="features">
          <FeaturesTab />
        </TabsContent>
        
        <TabsContent value="background">
          <BackgroundTab />
        </TabsContent>
        
        <TabsContent value="handbook">
          <HandbookTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
