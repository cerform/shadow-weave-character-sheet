
import React, { useState, useEffect, useCallback } from 'react';
import { Character } from '@/types/character';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';

interface SpellSlotManagerProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  showTitle?: boolean;
}

const SpellSlotManager: React.FC<SpellSlotManagerProps> = ({ character, onUpdate, showTitle = true }) => {
  const [spellcastingAbility, setSpellcastingAbility] = useState(character.spellcasting?.ability || 'intelligence');
  const { theme } = useTheme();
  const { toast } = useToast();
  const { updateCharacter } = useCharacter();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const maxLevel = 9;

  const handleSpellcastingAbilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAbility = e.target.value;
    setSpellcastingAbility(newAbility);
    
    updateSpellcasting({
      ability: newAbility
    });
  };
  
  const updateSpellcasting = (updates: any) => {
    if (!character.spellcasting) {
      onUpdate({
        ...character,
        spellcasting: {
          ...updates
        }
      });
    } else {
      onUpdate({
        ...character,
        spellcasting: {
          ...character.spellcasting,
          ...updates
        }
      });
    }
  };

  const handleSlotChange = (level: number, change: number) => {
    if (!character.spellSlots) {
      const initialSlots: Record<number, { max: number; used: number }> = {};
      for (let i = 1; i <= maxLevel; i++) {
        initialSlots[i] = { max: 0, used: 0 };
      }
      onUpdate({
        ...character,
        spellSlots: initialSlots
      });
      return;
    }
    
    const currentSlots = character.spellSlots[level] || { max: 0, used: 0 };
    const newMax = Math.max(0, (currentSlots.max || 0) + change);
    
    const updatedSlots = {
      ...character.spellSlots,
      [level]: {
        max: newMax,
        used: currentSlots.used || 0
      }
    };
    
    onUpdate({
      ...character,
      spellSlots: updatedSlots
    });
  };

  const handleSlotUsed = (level: number, change: number) => {
    if (!character.spellSlots) {
      const initialSlots: Record<number, { max: number; used: number }> = {};
      for (let i = 1; i <= maxLevel; i++) {
        initialSlots[i] = { max: 0, used: 0 };
      }
      onUpdate({
        ...character,
        spellSlots: initialSlots
      });
      return;
    }
    
    const currentSlots = character.spellSlots[level] || { max: 0, used: 0 };
    const newUsed = Math.max(0, Math.min(currentSlots.max || 0, (currentSlots.used || 0) + change));
    
    const updatedSlots = {
      ...character.spellSlots,
      [level]: {
        max: currentSlots.max || 0,
        used: newUsed
      }
    };
    
    onUpdate({
      ...character,
      spellSlots: updatedSlots
    });
  };

  // Обработчик сброса слотов заклинаний после короткого отдыха
  const handleResetAfterShortRest = () => {
    const currentChar = character;
    
    if (!currentChar) return;
    
    // Магический архетип воина, колдун и некоторые другие классы восстанавливают слоты после короткого отдыха
    if (['колдун', 'warlock'].includes(currentChar.class?.toLowerCase() || '')) {
      const updatedCharacter = { ...currentChar };
      
      if (!updatedCharacter.spellSlots) {
        updatedCharacter.spellSlots = {};
      }
      
      // Сбрасываем использованные слоты
      const updatedSlots = { ...updatedCharacter.spellSlots };
      Object.keys(updatedSlots).forEach(level => {
        const lvl = parseInt(level);
        if (lvl <= maxLevel) {
          updatedSlots[lvl] = {
            ...updatedSlots[lvl],
            used: 0
          };
        }
      });
      
      updatedCharacter.spellSlots = updatedSlots;
      updateCharacter(updatedCharacter);
      toast({
        title: "Слоты заклинаний восстановлены",
        description: `Восстановлены слоты заклинаний для ${currentChar.name}`,
      });
    }
  };

  const getSpellModifier = useCallback(() => {
    if (!character.abilities) return 0;
    
    const ability = character.spellcasting?.ability || 'intelligence';
    const abilityScore = character.abilities[ability as keyof typeof character.abilities] || 10;
    return calculateAbilityModifier(abilityScore);
  }, [character]);

  const getSpellSaveDC = useCallback(() => {
    const profBonus = character.proficiencyBonus || 2;
    return 8 + profBonus + getSpellModifier();
  }, [character, getSpellModifier]);

  const getSpellAttackBonus = useCallback(() => {
    const profBonus = character.proficiencyBonus || 2;
    return profBonus + getSpellModifier();
  }, [character, getSpellModifier]);

  return (
    <div className="grid gap-4">
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Слоты заклинаний</CardTitle>
          </CardHeader>
        )}
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="spellcastingAbility">Базовая характеристика</Label>
            <select
              id="spellcastingAbility"
              className="w-full p-2 border rounded"
              value={spellcastingAbility}
              onChange={handleSpellcastingAbilityChange}
              style={{
                backgroundColor: currentTheme.cardBackground,
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <option value="strength">Сила</option>
              <option value="dexterity">Ловкость</option>
              <option value="constitution">Телосложение</option>
              <option value="intelligence">Интеллект</option>
              <option value="wisdom">Мудрость</option>
              <option value="charisma">Харизма</option>
            </select>
          </div>
          <div>
            <Label>Сложность спасброска</Label>
            <Input
              type="text"
              value={getSpellSaveDC()}
              readOnly
              style={{
                backgroundColor: currentTheme.cardBackground,
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            />
          </div>
          <div>
            <Label>Бонус атаки заклинанием</Label>
            <Input
              type="text"
              value={getSpellAttackBonus()}
              readOnly
              style={{
                backgroundColor: currentTheme.cardBackground,
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Управление слотами</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 p-4">
              {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
                const slotInfo = character.spellSlots?.[level] || { max: 0, used: 0 };
                return (
                  <Card key={level} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div style={{color: currentTheme.textColor}}>
                        {level}-й уровень
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSlotChange(level, 1)}
                        >
                          +
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center"
                          value={slotInfo.max || 0}
                          readOnly
                          style={{
                            backgroundColor: currentTheme.cardBackground,
                            borderColor: currentTheme.accent,
                            color: currentTheme.textColor
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSlotChange(level, -1)}
                        >
                          -
                        </Button>
                        <Separator orientation="vertical" className="h-6 bg-accent/30" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSlotUsed(level, 1)}
                        >
                          Использовать
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center"
                          value={slotInfo.used || 0}
                          readOnly
                          style={{
                            backgroundColor: currentTheme.cardBackground,
                            borderColor: currentTheme.accent,
                            color: currentTheme.textColor
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSlotUsed(level, -1)}
                        >
                          Восстановить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Button onClick={handleResetAfterShortRest}>
        Восстановить слоты после короткого отдыха
      </Button>
    </div>
  );
};

export default SpellSlotManager;
