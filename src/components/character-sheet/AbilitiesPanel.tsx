
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/contexts/CharacterContext';

interface AbilitiesPanelProps {
  character: Character | null;
}

export const AbilitiesPanel: React.FC<AbilitiesPanelProps> = ({ character }) => {
  const getModifier = (score: number | undefined) => {
    if (!score) return "+0";
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Характеристики</CardTitle>
      </CardHeader>
      <CardContent>
        {character && character.abilities ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-bold">СИЛ</div>
              <div className="text-2xl">{character.abilities.strength}</div>
              <div className="text-sm">{getModifier(character.abilities.strength)}</div>
            </div>
            <div className="text-center">
              <div className="font-bold">ЛОВ</div>
              <div className="text-2xl">{character.abilities.dexterity}</div>
              <div className="text-sm">{getModifier(character.abilities.dexterity)}</div>
            </div>
            <div className="text-center">
              <div className="font-bold">ТЕЛ</div>
              <div className="text-2xl">{character.abilities.constitution}</div>
              <div className="text-sm">{getModifier(character.abilities.constitution)}</div>
            </div>
            <div className="text-center">
              <div className="font-bold">ИНТ</div>
              <div className="text-2xl">{character.abilities.intelligence}</div>
              <div className="text-sm">{getModifier(character.abilities.intelligence)}</div>
            </div>
            <div className="text-center">
              <div className="font-bold">МДР</div>
              <div className="text-2xl">{character.abilities.wisdom}</div>
              <div className="text-sm">{getModifier(character.abilities.wisdom)}</div>
            </div>
            <div className="text-center">
              <div className="font-bold">ХАР</div>
              <div className="text-2xl">{character.abilities.charisma}</div>
              <div className="text-sm">{getModifier(character.abilities.charisma)}</div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Не удалось загрузить характеристики персонажа.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AbilitiesPanel;
