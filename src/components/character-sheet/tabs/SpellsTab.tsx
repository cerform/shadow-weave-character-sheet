
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getDefaultCastingAbility, calculateSpellcastingDC, calculateSpellAttackBonus } from "@/utils/spellUtils";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onSpellClick?: (spell: SpellData) => void;
}

// Fix for line 53 - converting string spells to CharacterSpell objects

// Add this utility function
const ensureCharacterSpellTypes = (spells: (string | CharacterSpell)[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { 
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell, 
        level: 0 
      };
    }
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

export const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate, onSpellClick }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Then use it when updating spells
  const toggleSpellPrepared = (spellName: string) => {
    if (!character.spells) return;
    
    const typedSpells = ensureCharacterSpellTypes(character.spells);
    
    const updatedSpells = typedSpells.map(spell => {
      if (spell.name === spellName) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdate({ spells: updatedSpells });
  };

  // Calculate spellcasting info
  const defaultAbility = getDefaultCastingAbility(character.class);
  const spellSaveDC = calculateSpellcastingDC(character);
  const spellAttackBonus = calculateSpellAttackBonus(character);

  return (
    <div className="space-y-4">
      {/* Spellcasting Information Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>
            Информация о заклинаниях
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Базовая характеристика</p>
              <p className="font-medium" style={{ color: currentTheme.textColor }}>
                {defaultAbility === "charisma" ? "Харизма" : 
                 defaultAbility === "intelligence" ? "Интеллект" : 
                 defaultAbility === "wisdom" ? "Мудрость" : "Не определено"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Сложность спасброска</p>
              <p className="font-medium" style={{ color: currentTheme.textColor }}>
                {spellSaveDC}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Бонус атаки заклинанием</p>
              <p className="font-medium" style={{ color: currentTheme.textColor }}>
                +{spellAttackBonus}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Spell Slots Card */}
      {character.spellSlots && Object.keys(character.spellSlots).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.textColor }}>
              Ячейки заклинаний
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(character.spellSlots).map(([level, slots]) => (
                <div key={`spell-slot-${level}`} className="flex items-center justify-between space-x-2">
                  <span style={{ color: currentTheme.textColor }}>{level}-й уровень:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: slots.max }).map((_, i) => (
                      <span
                        key={`slot-${level}-${i}`}
                        className={`inline-block w-4 h-4 rounded-full border ${
                          i < (slots.max - slots.used) ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        onClick={() => {
                          const updatedSlots = { ...character.spellSlots };
                          if (i < (slots.max - slots.used)) {
                            // Mark slot as used
                            updatedSlots[level] = { ...slots, used: slots.used + 1 };
                          } else if (slots.used > 0) {
                            // Mark slot as available
                            updatedSlots[level] = { ...slots, used: slots.used - 1 };
                          }
                          onUpdate({ spellSlots: updatedSlots });
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpellsTab;
