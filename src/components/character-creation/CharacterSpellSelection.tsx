
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from './NavigationButtons';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { 
    availableSpells, 
    loadSpellsForCharacter 
  } = useSpellbook();

  const [selectedSpells, setSelectedSpells] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (character && character.class) {
      loadSpellsForCharacter(character.class, character.level || 1);
    }
  }, [character?.class, character?.level]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выбор заклинаний</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            Загружаем заклинания...
          </div>
        </CardContent>
      </Card>
      
      <NavigationButtons
        prevStep={prevStep}
        nextStep={nextStep}
        nextText="Сохранить и продолжить"
        disableNext={false}
      />
    </div>
  );
};

export default CharacterSpellSelection;
