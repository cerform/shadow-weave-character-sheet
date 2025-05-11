
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

  // Ensure character has a properly structured spellSlots property
  const spellSlots = character.spellSlots || {};

  const handleSpellSlotsChange = (level: number, newSlots: number) => {
    if (!character || !updateCharacter) return;

    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = newSlots;

    updateCharacter({ spellSlots: updatedSpellSlots });
  };

  // Calculate max slots for each level based on character class and level
  const getMaxSlotsForLevel = (level: number): number => {
    // This is a placeholder, ideally you'd have logic based on class and level
    // For now, using a simplified version
    const maxSlotsByLevel: Record<number, number> = {
      1: 4,
      2: 3,
      3: 3,
      4: 3,
      5: 2,
      6: 1,
      7: 1,
      8: 1,
      9: 1
    };
    
    return maxSlotsByLevel[level] || 0;
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
          const currentSlots = typeof spellSlots[level] === 'number' ? spellSlots[level] : 0;
          const maxSlots = getMaxSlotsForLevel(level);

          return (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">{getSpellLevelName(level)}</Badge>
                <span>{spellCount} заклинаний</span>
              </div>
              <SpellSlotsPopover
                level={level}
                currentSlots={currentSlots}
                maxSlots={maxSlots}
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
