import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';

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
import { RestPanel } from './RestPanel';

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
    <div className="character-sheet w-full max-w-[1200px] mx-auto p-4">
      {/* Top Bar with Character Name and Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <CharacterHeader
          character={character}
          onUpdate={handleUpdateCharacter}
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={importFromJSON}>
            <FileUp className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          <CharacterExportPDF character={character} />
          <SaveCharacterButton character={character} />
        </div>
      </div>
      
      {/* Character Info Header */}
      <CharacterInfoHeader character={character} />
      
      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left Column: Stats */}
        <div className="col-span-1">
          {/* Health Bar */}
          <div className="mb-4">
            <HPBar
              current={character.currentHp || 0}
              max={character.maxHp || 1}
              temporary={character.temporaryHp || 0}
              onUpdate={(hp) => handleUpdateCharacter(hp)}
            />
          </div>
          
          {/* Primary Resources */}
          <div className="mb-4">
            <CharacterContent
              character={character}
              onUpdate={handleUpdateCharacter}
              section="resources"
            />
          </div>
          
          {/* Dice Roller */}
          <div className="mb-4">
            <DicePanel
              character={character}
              onUpdate={handleUpdateCharacter}
            />
          </div>
          
          {/* Resource Management */}
          <div className="mb-4">
            <ResourcePanel
              character={character}
              onUpdate={handleUpdateCharacter}
            />
          </div>
        </div>
        
        {/* Center and Right Columns: Main Content */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tabs Navigation */}
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">Общее</TabsTrigger>
              <TabsTrigger value="skills">Навыки</TabsTrigger>
              <TabsTrigger value="management">Управление</TabsTrigger>
            </TabsList>
            
            {/* General Tab */}
            <TabsContent value="general">
              <CharacterTabs
                character={character}
                onUpdate={handleUpdateCharacter}
              />
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills">
              <CharacterContent
                character={character}
                onUpdate={handleUpdateCharacter}
                section="skills"
              />
            </TabsContent>
            
            {/* Management Tab */}
            <TabsContent value="management">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RestPanel
                    character={character}
                    onUpdate={handleUpdateCharacter}
                  />
                </div>
                <div>
                  <LevelUpPanel
                    character={character}
                    onUpdate={handleUpdateCharacter}
                  />
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Важно</AlertTitle>
                <AlertDescription>
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
