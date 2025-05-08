
import React, { useState, useEffect, useCallback } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { normalizeSpells } from '@/utils/spellUtils';
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

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [spellcastingAbility, setSpellcastingAbility] = useState(character.spellcasting?.ability || 'intelligence');
  const [preparedSpells, setPreparedSpells] = useState<CharacterSpell[]>([]);
  const { theme } = useTheme();
  const { toast } = useToast();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    if (character.spells) {
      // Используем normalizeSpells, чтобы преобразовать строки в объекты CharacterSpell
      const normalizedSpells = normalizeSpells(character);
      // Фильтруем только подготовленные заклинания
      const prepared = normalizedSpells.filter(spell => spell.prepared);
      setPreparedSpells(prepared);
    }
  }, [character.spells]);

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
        spellcasting: {
          ...updates
        }
      });
    } else {
      onUpdate({
        spellcasting: {
          ...character.spellcasting,
          ...updates
        }
      });
    }
  };

  const toggleSpellPreparation = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = normalizeSpells(character).map(s => {
      if (s.name === spell.name) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });
    
    onUpdate({ spells: updatedSpells });
    
    // Update local state
    setPreparedSpells(updatedSpells.filter(spell => spell.prepared));
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
        <CardHeader>
          <CardTitle>Информация о заклинаниях</CardTitle>
        </CardHeader>
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
          <CardTitle>Список заклинаний</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 p-4">
              {normalizeSpells(character).length > 0 ? (
                normalizeSpells(character).map((spell) => (
                  <Card key={spell.name} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div style={{color: currentTheme.textColor}}>
                        {spell.name} ({spell.level}, {spell.school})
                      </div>
                      <Badge
                        variant={spell.prepared ? "default" : "outline"}
                        onClick={() => toggleSpellPreparation(spell)}
                        style={{
                          backgroundColor: spell.prepared ? currentTheme.accent : currentTheme.background,
                          color: spell.prepared ? currentTheme.background : currentTheme.accent,
                          cursor: 'pointer',
                        }}
                      >
                        {spell.prepared ? 'Подготовлено' : 'Не подготовлено'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Нет известных заклинаний.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpellsTab;
