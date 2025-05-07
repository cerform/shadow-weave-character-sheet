
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
import RestPanel from './RestPanel';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterSheet = ({ character, onUpdate }: CharacterSheetProps) => {
  return (
    <div className="bg-card bg-opacity-90 rounded-lg shadow-lg border border-primary/20 p-4">
      <CharacterHeader character={character} onUpdate={onUpdate} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <CharacterInfoHeader character={character} />
        </div>
        <div>
          <HPBar character={character} onUpdate={onUpdate} />
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <DicePanel character={character} />
        </div>
        <div>
          <ResourcePanel character={character} onUpdate={onUpdate} />
        </div>
        <div>
          <RestPanel character={character} onUpdate={onUpdate} />
        </div>
      </div>
      
      <div className="mt-6">
        <CharacterTabs character={character} onUpdate={onUpdate} />
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <SaveCharacterButton character={character} />
        <CharacterExportPDF character={character} />
      </div>
      
      <LevelUpPanel character={character} onUpdate={onUpdate} />
    </div>
  );
};

// Make sure to export the component as default
export default CharacterSheet;
