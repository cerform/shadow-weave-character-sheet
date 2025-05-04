
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';

interface HitPointsPanelProps {
  character: Character | null;
}

export const HitPointsPanel: React.FC<HitPointsPanelProps> = ({ character }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Здоровье</CardTitle>
      </CardHeader>
      <CardContent>
        {character ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Текущее здоровье</p>
              <p className="text-2xl font-bold">
                {character.currentHp !== undefined ? character.currentHp : (character.hitPoints?.current || 0)} / 
                {character.maxHp !== undefined ? character.maxHp : (character.hitPoints?.maximum || 0)}
              </p>
            </div>
            {(character.temporaryHp !== undefined ? character.temporaryHp > 0 : character.hitPoints?.temporary && character.hitPoints.temporary > 0) && (
              <div>
                <p className="text-sm text-muted-foreground">Временное здоровье</p>
                <p className="text-xl font-semibold text-blue-500">
                  {character.temporaryHp !== undefined ? character.temporaryHp : character.hitPoints?.temporary}
                </p>
              </div>
            )}
            {character.hitDice && (
              <div>
                <p className="text-sm text-muted-foreground">Кости хитов</p>
                <p className="text-lg">{character.hitDice.current || character.hitDice.total - (character.hitDice.used || 0)}/{character.hitDice.total} {character.hitDice.value}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Не удалось загрузить информацию о здоровье.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HitPointsPanel;
