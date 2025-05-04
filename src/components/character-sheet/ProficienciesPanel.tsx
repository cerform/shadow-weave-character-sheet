
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/contexts/CharacterContext';

interface ProficienciesPanelProps {
  character: Character | null;
}

export const ProficienciesPanel: React.FC<ProficienciesPanelProps> = ({ character }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Владения</CardTitle>
      </CardHeader>
      <CardContent>
        {character ? (
          <div className="space-y-2">
            <p className="text-muted-foreground">Владения персонажа будут отображаться здесь.</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Не удалось загрузить владения персонажа.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProficienciesPanel;
