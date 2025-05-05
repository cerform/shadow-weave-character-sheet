
import React from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LevelUpPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const LevelUpPanel: React.FC<LevelUpPanelProps> = ({ character, onUpdate }) => {
  const handleLevelUp = () => {
    const newLevel = (character.level || 1) + 1;
    onUpdate({ level: newLevel });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Повышение уровня</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Текущий уровень: {character.level || 1}</span>
            <Button onClick={handleLevelUp}>Повысить уровень</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Повышение уровня даст вам новые способности и увеличит ваши характеристики в зависимости от класса.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelUpPanel;
