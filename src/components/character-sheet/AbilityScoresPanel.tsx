
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getModifierFromAbilityScore } from '@/utils/characterUtils';

interface AbilityScoresPanelProps {
  character: any;
}

const AbilityScoresPanel: React.FC<AbilityScoresPanelProps> = ({ character }) => {
  const abilities = [
    { key: 'strength', name: 'Сила', short: 'СИЛ' },
    { key: 'dexterity', name: 'Ловкость', short: 'ЛОВ' },
    { key: 'constitution', name: 'Телосложение', short: 'ТЕЛ' },
    { key: 'intelligence', name: 'Интеллект', short: 'ИНТ' },
    { key: 'wisdom', name: 'Мудрость', short: 'МДР' },
    { key: 'charisma', name: 'Харизма', short: 'ХАР' },
  ];

  const getAbilityScore = (key: string) => {
    if (!character || !character.abilities) return 10;
    return character.abilities[key] || 10;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
        <div className="grid grid-cols-3 gap-3">
          {abilities.map((ability) => (
            <div key={ability.key} className="text-center p-2 border border-primary/20 rounded-md hover:bg-primary/5">
              <div className="text-sm text-muted-foreground">{ability.short}</div>
              <div className="text-xl font-bold">{getAbilityScore(ability.key)}</div>
              <div className="text-sm font-medium">
                {getModifierFromAbilityScore(getAbilityScore(ability.key))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbilityScoresPanel;
