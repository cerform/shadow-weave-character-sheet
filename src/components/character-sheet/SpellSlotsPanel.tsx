import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpellbook } from "@/hooks/useSpellbook";
import { useCharacter } from "@/contexts/CharacterContext";
import { SpellSlotsPopover } from './SpellSlotsPopover';
import { getSpellLevelName } from '@/utils/spellHelpers';

interface SpellSlotsPanelProps {
  className?: string;
}

export const SpellSlotsPanel: React.FC<SpellSlotsPanelProps> = ({ className }) => {
  const { character, updateCharacter } = useCharacter();
  const { getSelectedSpellCount } = useSpellbook();

  if (!character) {
    return null;
  }

  const handleSpellSlotsChange = (level: number, newSlots: number) => {
    if (!character || !updateCharacter) return;

    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = newSlots;

    updateCharacter({ spellSlots: updatedSpellSlots });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ячейки заклинаний</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(9)].map((_, i) => {
          const level = i + 1;
          const spellCount = getSelectedSpellCount(level);
          const hasSpells = spellCount > 0;

          return (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">{getSpellLevelName(level)}</Badge>
                <span>{spellCount} заклинаний</span>
              </div>
              <SpellSlotsPopover
                level={level}
                slots={character.spellSlots?.[level] || 0}
                onSlotsChange={(newSlots) => handleSpellSlotsChange(level, newSlots)}
                disabled={!hasSpells}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SpellSlotsPanel;
