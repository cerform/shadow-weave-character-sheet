import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';

interface StatsPanelProps {
  character: Character | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { updateCharacter } = useCharacter();
  const [tempHp, setTempHp] = useState(0);

  const handleAddTempHp = () => {
    if (!character) return;
    
    // Create a partial update preserving the same structure as the Character interface
    const update: Partial<Character> = {};
    
    // Check if character already has temporaryHp defined
    if (character.temporaryHp !== undefined) {
      update.temporaryHp = (character.temporaryHp || 0) + 1;
    } 
    // Otherwise, check if it has the hitPoints structure
    else if (character.hitPoints) {
      update.hitPoints = {
        ...character.hitPoints,
        temporary: (character.hitPoints.temporary || 0) + 1
      };
    }
    // If neither exist, add temporaryHp
    else {
      update.temporaryHp = 1;
    }
    
    updateCharacter(update);
  };

  const handleRemoveTempHp = () => {
    if (!character) return;
    
    // Check if the character has temporary HP to reduce
    const tempHp = character.temporaryHp !== undefined 
      ? character.temporaryHp 
      : character.hitPoints?.temporary;
    
    if (!tempHp || tempHp <= 0) return;

    // Create the appropriate update
    const update: Partial<Character> = {};
    
    if (character.temporaryHp !== undefined) {
      update.temporaryHp = character.temporaryHp - 1;
    } else if (character.hitPoints) {
      update.hitPoints = {
        ...character.hitPoints,
        temporary: (character.hitPoints.temporary || 0) - 1
      };
    }
    
    updateCharacter(update);
  };
  
  // Get the appropriate temporary HP value to display
  const displayTempHp = character
    ? (character.temporaryHp !== undefined ? character.temporaryHp : character.hitPoints?.temporary || 0)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Характеристики</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm text-muted-foreground">Временные хиты</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleRemoveTempHp} disabled={!character || displayTempHp <= 0}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span>{displayTempHp}</span>
            <Button variant="outline" size="icon" onClick={handleAddTempHp} disabled={!character}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
