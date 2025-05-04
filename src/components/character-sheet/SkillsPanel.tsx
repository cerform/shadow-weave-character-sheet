import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';

interface SkillsPanelProps {
  character: Character | null;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Навыки</CardTitle>
      </CardHeader>
      <CardContent>
        {character ? (
          <div className="space-y-2">
            <p className="text-muted-foreground">Навыки персонажа будут отображаться здесь.</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Не удалось загрузить навыки персонажа.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
