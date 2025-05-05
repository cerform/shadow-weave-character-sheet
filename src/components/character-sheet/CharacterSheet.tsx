
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character.d';
import CharacterTabs from './CharacterTabs';
import CharacterHeader from './CharacterHeader';
import ResourcePanel from './ResourcePanel';
import RestPanel from './RestPanel';
import SpellPanel from './SpellPanel';
import { useCharacter } from '@/contexts/CharacterContext';

interface CharacterSheetProps {
  character: Character | null;
  isDM?: boolean;
}

const CharacterSheet = ({ character, isDM = false }: CharacterSheetProps) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { updateCharacter } = useCharacter();
  const [activeTab, setActiveTab] = useState("stats");
  
  if (!character) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="p-8 bg-card/50">
          <p className="text-lg text-muted-foreground">
            Не выбран персонаж. Пожалуйста, выберите или создайте персонажа.
          </p>
        </Card>
      </div>
    );
  }
  
  const handleUpdate = (updates: Partial<Character>) => {
    if (character) {
      updateCharacter({
        ...character,
        ...updates
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CharacterHeader 
            character={character} 
            onUpdate={handleUpdate}
          />
          
          <CharacterTabs 
            character={character} 
            onUpdate={handleUpdate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDM={isDM}
          />
        </div>
        
        <div className="space-y-6">
          <ResourcePanel 
            character={character} 
            onUpdate={handleUpdate}
            isDM={isDM}
          />
          
          <RestPanel 
            character={character} 
            onUpdate={handleUpdate}
          />
          
          {activeTab === "spells" && (
            <div className="hidden lg:block">
              {/* Пустой div для соответствия макету на десктопе */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
