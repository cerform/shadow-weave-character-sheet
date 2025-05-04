import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';
import { Button } from "@/components/ui/button";

export interface RestPanelProps {
  character: Character;
  onHitPointsChange: (newHitPoints: number) => void;
  onHitDiceChange: (usedHitDice: number) => void;
  onSpellSlotsChange: (level: string, used: number) => void;
  onSorceryPointsChange: (used: number) => void;
}

const RestPanel = ({
  character,
  onHitPointsChange,
  onHitDiceChange,
  onSpellSlotsChange,
  onSorceryPointsChange
}: RestPanelProps) => {
  // Заглушка для короткого отдыха
  const handleShortRest = () => {
    console.log("Короткий отдых");
    // Логика короткого отдыха будет реализована позже
  };

  // Заглушка для длинного отдыха
  const handleLongRest = () => {
    console.log("Длинный отдых");
    // Логика длинного отдыха будет реализована позже
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Отдых</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Короткий отдых</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Персонаж восстанавливает часть хитов, тратя кости хитов.
          </p>
          <Button variant="outline" onClick={handleShortRest}>
            Короткий отдых
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Длинный отдых</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Персонаж восстанавливает все хиты, половину потраченных костей хитов, все ячейки заклинаний и особые умения.
          </p>
          <Button onClick={handleLongRest}>
            Длинный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
