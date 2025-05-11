
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
    
    // Convert to object structure if it's a number
    if (typeof updatedSpellSlots[level] === 'number' || !updatedSpellSlots[level]) {
      const maxSlots = getMaxSlotsForLevel(level);
      updatedSpellSlots[level] = {
        max: maxSlots,
        used: maxSlots - newSlots
      };
    } else {
      // Update existing object structure
      updatedSpellSlots[level] = {
        ...updatedSpellSlots[level],
        used: updatedSpellSlots[level].max - newSlots
      };
    }

    updateCharacter({ spellSlots: updatedSpellSlots });
  };

  // Calculate max slots for each level based on character class and level
  const getMaxSlotsForLevel = (level: number): number => {
    // Упрощенная версия, вы можете заменить её на более сложную логику
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

  // Получение текущего количества слотов (совместимо с обоими форматами)
  const getCurrentSlots = (level: number): number => {
    if (!spellSlots[level]) return 0;
    
    if (typeof spellSlots[level] === 'number') {
      return spellSlots[level] as number;
    } else {
      const slotObj = spellSlots[level] as { max: number; used: number };
      return slotObj.max - slotObj.used;
    }
  };

  // Получение максимального количества слотов (совместимо с обоими форматами)
  const getMaxSlots = (level: number): number => {
    if (!spellSlots[level]) return getMaxSlotsForLevel(level);
    
    if (typeof spellSlots[level] === 'number') {
      return getMaxSlotsForLevel(level);
    } else {
      const slotObj = spellSlots[level] as { max: number; used: number };
      return slotObj.max;
    }
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
          const currentSlots = getCurrentSlots(level);
          const maxSlots = getMaxSlots(level);

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
