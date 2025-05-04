
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CharacterHeader } from './CharacterHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoPanel from './InfoPanel';
import AbilitiesPanel from './AbilitiesPanel';
import SkillsPanel from './SkillsPanel';
import ProficienciesPanel from './ProficienciesPanel';
import EquipmentPanel from './EquipmentPanel';
import SpellPanel from './SpellPanel';
import HitPointsPanel from './HitPointsPanel';
import FeaturesPanel from './FeaturesPanel';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/contexts/CharacterContext';
import EditCharacterButton from './EditCharacterButton';
import RestPanel from "./RestPanel";
import { SpellsTab } from './tabs/SpellsTab';

interface CharacterSheetProps {
  character: Character | null;
  isDM?: boolean;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, isDM }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [activeTab, setActiveTab] = useState("info");

  const handleUpdateCharacter = (updates: Partial<Character>) => {
    // Here you would typically call a function to update the character data
    // For now, let's just log the updates
    console.log("Character updated:", updates);
  };

  return (
    <div className="min-h-screen w-full p-6">
      {character ? (
        <div className="max-w-5xl mx-auto space-y-4">
          <CharacterHeader name={character.name} class={character.class} level={character.level} />

          <Tabs defaultValue="info" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="info">Информация</TabsTrigger>
              <TabsTrigger value="abilities">Характеристики</TabsTrigger>
              <TabsTrigger value="skills">Навыки</TabsTrigger>
              <TabsTrigger value="proficiencies">Владения</TabsTrigger>
              <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
              <TabsTrigger value="spells">Заклинания</TabsTrigger>
              <TabsTrigger value="features">Особенности</TabsTrigger>
              {isDM && <TabsTrigger value="rest">Отдых</TabsTrigger>}
            </TabsList>
            <div className="mt-4">
              <TabsContent value="info">
                <InfoPanel character={character} />
              </TabsContent>
              <TabsContent value="abilities">
                <AbilitiesPanel character={character} />
              </TabsContent>
              <TabsContent value="skills">
                <SkillsPanel character={character} />
              </TabsContent>
              <TabsContent value="proficiencies">
                <ProficienciesPanel character={character} />
              </TabsContent>
              <TabsContent value="equipment">
                <EquipmentPanel character={character} />
              </TabsContent>
              <TabsContent value="spells">
                <SpellsTab character={character} onUpdate={handleUpdateCharacter} />
              </TabsContent>
              <TabsContent value="features">
                <FeaturesPanel character={character} />
              </TabsContent>
              {isDM && (
                <TabsContent value="rest">
                  <RestPanel 
                    character={character} 
                    onHitPointsChange={() => {}} 
                    onHitDiceChange={() => {}} 
                    onSpellSlotsChange={() => {}} 
                    onSorceryPointsChange={() => {}} 
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>

          <div className="flex justify-center mt-4">
            <EditCharacterButton characterId={character.id || 'new'} />
          </div>
        </div>
      ) : (
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6 text-center">
            <p style={{ color: currentTheme.mutedTextColor }}>Персонаж не выбран.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CharacterSheet;
