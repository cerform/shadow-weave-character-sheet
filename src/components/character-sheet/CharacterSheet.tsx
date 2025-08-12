
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterDefaults';

// Custom components
import CharacterContent from './CharacterContent';
import CharacterTabs from './CharacterTabs';
import CharacterInfoHeader from './CharacterInfoHeader';
import SaveCharacterButton from './SaveCharacterButton';
import CharacterExportPDF from './CharacterExportPDF';
import { CharacterHeader } from './CharacterHeader';
import LevelUpPanel from './LevelUpPanel';
import { HPBar } from './HPBar';
import DicePanel from './DicePanel';
import ResourcePanel from './ResourcePanel';
import RestPanel from './RestPanel';
import { CharacterPortrait } from './CharacterPortrait';
import { StatsPanel } from './StatsPanel';
import SkillsPanel from './SkillsPanel';

interface CharacterSheetProps {
  character?: Character;
  onUpdate?: (updates: Partial<Character>) => void;
  isPreview?: boolean;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character: initialCharacter, onUpdate, isPreview = false }) => {
  const [character, setCharacter] = useState<Character>(initialCharacter || createDefaultCharacter());
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { sendUpdate } = useSocket();
  
  // Update character when initialCharacter changes
  useEffect(() => {
    if (initialCharacter) {
      setCharacter(initialCharacter);
    }
  }, [initialCharacter]);
  
  // Handle character updates
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    // Merge updates with current character
    const updatedCharacter = { ...character, ...updates };
    
    // Update local state
    setCharacter(updatedCharacter);
    
    // Call parent onUpdate if provided
    if (onUpdate) {
      onUpdate(updates);
    }
    
    // Send updates to socket if connected
    if (sendUpdate && !isPreview) {
      sendUpdate(updatedCharacter);
    }
  };
  
  // Import character from JSON
  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedCharacter = JSON.parse(event.target?.result as string);
            setCharacter(importedCharacter);
            
            if (onUpdate) {
              onUpdate(importedCharacter);
            }
            
            toast({
              title: "Успешно импортировано",
              description: "Персонаж загружен из JSON файла.",
            });
          } catch (error) {
            toast({
              title: "Ошибка импорта",
              description: "Невозможно загрузить файл. Убедитесь, что это корректный JSON.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="character-sheet w-full max-w-[1600px] mx-auto p-4 space-y-6">
      {/* Character Portrait & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CharacterPortrait
            character={character}
            onUpdate={handleUpdateCharacter}
          />
        </div>
        
        <div className="flex flex-col justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={importFromJSON}>
              <FileUp className="h-4 w-4 mr-2" />
              Импорт
            </Button>
            <CharacterExportPDF character={character} />
            <SaveCharacterButton character={character} />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Stats & Resources */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ability Scores */}
          <StatsPanel character={character} />
          
          {/* Health & Resources */}
          <HPBar
            currentHp={character.currentHp || 0}
            maxHp={character.maxHp || 1}
            temporaryHp={character.tempHp || character.temporaryHp || 0}
            onUpdate={(hp) => handleUpdateCharacter(hp)}
          />
          
          {/* Dice Roller */}
          <DicePanel
            character={character}
            onUpdate={handleUpdateCharacter}
          />
          
          {/* Resource Management */}
          <ResourcePanel
            character={character}
            onUpdate={handleUpdateCharacter}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="rpg-tabs">
            {/* Enhanced Tabs Navigation */}
            <TabsList className="grid grid-cols-3 mb-6 h-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <TabsTrigger 
                value="general" 
                className="rpg-tab-trigger font-fantasy-header"
              >
                🎭 Общее
              </TabsTrigger>
              <TabsTrigger 
                value="skills" 
                className="rpg-tab-trigger font-fantasy-header"
              >
                ⚔️ Навыки
              </TabsTrigger>
              <TabsTrigger 
                value="management" 
                className="rpg-tab-trigger font-fantasy-header"
              >
                🔧 Управление
              </TabsTrigger>
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <CharacterTabs
                character={character}
                onUpdate={handleUpdateCharacter}
              />
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4">
              <SkillsPanel
                character={character}
              />
            </TabsContent>
            
            {/* Management Tab */}
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RestPanel
                  character={character}
                  onUpdate={handleUpdateCharacter}
                />
                <LevelUpPanel
                  character={character}
                  onUpdate={handleUpdateCharacter}
                />
              </div>
              
              <Alert className="rpg-panel">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-fantasy-header">Важно</AlertTitle>
                <AlertDescription className="font-fantasy-body">
                  Изменения в персонаже будут сохранены только после нажатия на кнопку "Сохранить персонажа".
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
