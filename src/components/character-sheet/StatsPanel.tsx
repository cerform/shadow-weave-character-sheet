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
    if (character) {
      updateCharacter({ temporaryHp: (character.temporaryHp || 0) + 1 });
    }
  };

  const handleRemoveTempHp = () => {
    if (character && character.temporaryHp && character.temporaryHp > 0) {
      updateCharacter({ temporaryHp: character.temporaryHp - 1 });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Характеристики</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm text-muted-foreground">Временные хиты</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleRemoveTempHp} disabled={!character || !character.temporaryHp || character.temporaryHp <= 0}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span>{character?.temporaryHp || 0}</span>
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
