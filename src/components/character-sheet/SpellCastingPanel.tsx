import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Wand2, BookOpen, Brain } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getAbilityModifier } from '@/utils/characterUtils';

export interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character, onUpdate }) => {
  const [spellcastingAbility, setSpellcastingAbility] = useState(
    character.spellcasting?.ability || getDefaultSpellcastingAbility(character.class || '')
  );

  // Calculate spell save DC and attack bonus
  const abilityModifier = getAbilityModifier(character, spellcastingAbility);
  const profBonus = character.proficiencyBonus || 2;
  const spellSaveDC = 8 + abilityModifier + profBonus;
  const spellAttackBonus = abilityModifier + profBonus;

  // Handle ability change
  const handleAbilityChange = (value: string) => {
    setSpellcastingAbility(value);
    
    // Update character's spellcasting info
    onUpdate({
      spellcasting: {
        ...(character.spellcasting || {}),
        ability: value,
        spellSaveDC: 8 + getAbilityModifier(character, value) + profBonus,
        spellAttackBonus: getAbilityModifier(character, value) + profBonus
      }
    });
  };

  // Handle spell slots update
  const handleSpellSlotChange = (level: number, type: 'max' | 'used', value: number) => {
    const newSpellSlots = { ...(character.spellSlots || {}) };
    
    if (!newSpellSlots[level]) {
      newSpellSlots[level] = { max: 0, used: 0 };
    }
    
    newSpellSlots[level][type] = value;
    
    onUpdate({ spellSlots: newSpellSlots });
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Информация о заклинаниях</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spellcasting Ability */}
          <div>
            <Label htmlFor="spellcasting-ability" className="text-sm">Базовая характеристика</Label>
            <Select 
              value={spellcastingAbility} 
              onValueChange={handleAbilityChange}
            >
              <SelectTrigger id="spellcasting-ability" className="w-full">
                <SelectValue placeholder="Выберите характеристику" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STR">Сила</SelectItem>
                <SelectItem value="DEX">Ловкость</SelectItem>
                <SelectItem value="CON">Телосложение</SelectItem>
                <SelectItem value="INT">Интеллект</SelectItem>
                <SelectItem value="WIS">Мудрость</SelectItem>
                <SelectItem value="CHA">Харизма</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spell Save DC */}
          <div>
            <Label htmlFor="spell-save-dc" className="text-sm">Сложность спасброска</Label>
            <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background text-sm">
              <Brain className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{spellSaveDC}</span>
            </div>
          </div>

          {/* Spell Attack Bonus */}
          <div>
            <Label htmlFor="spell-attack-bonus" className="text-sm">Бонус атаки заклинанием</Label>
            <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background text-sm">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>+{spellAttackBonus}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Spell Slots */}
        <div>
          <h4 className="text-sm font-medium mb-2">Ячейки заклинаний</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
              const slots = character.spellSlots?.[level] || { max: 0, used: 0 };
              
              // Skip rendering if max slots is 0
              if (slots.max === 0) return null;
              
              return (
                <div key={level} className="border rounded-md p-2">
                  <Label className="text-xs block mb-1">{level} уровень</Label>
                  <div className="flex gap-2">
                    <div>
                      <Label className="text-xs">Макс</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="9"
                        value={slots.max} 
                        onChange={(e) => handleSpellSlotChange(level, 'max', parseInt(e.target.value) || 0)}
                        className="h-8 w-12 text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Исп</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max={slots.max}
                        value={slots.used} 
                        onChange={(e) => handleSpellSlotChange(level, 'used', parseInt(e.target.value) || 0)}
                        className="h-8 w-12 text-center"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spell Preparation (for classes that prepare spells) */}
        {shouldShowSpellPreparation(character.class || '') && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Подготовка заклинаний</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Можно подготовить:</span>
              <span className="font-medium">
                {calculatePreparedSpellsLimit(character)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({spellcastingAbility} мод. + уровень)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions
function getDefaultSpellcastingAbility(characterClass: string): string {
  const lowerClass = characterClass.toLowerCase();
  
  if (['бард', 'чародей', 'колдун', 'паладин'].includes(lowerClass)) {
    return 'CHA';
  } else if (['друид', 'жрец', 'следопыт'].includes(lowerClass)) {
    return 'WIS';
  }
  
  return 'INT'; // Default for wizard, artificer, etc.
}

function shouldShowSpellPreparation(characterClass: string): boolean {
  const lowerClass = characterClass.toLowerCase();
  return ['волшебник', 'жрец', 'друид', 'паладин', 'следопыт'].includes(lowerClass);
}

function calculatePreparedSpellsLimit(character: Character): number {
  if (!character.spellcasting?.ability) return 0;
  
  const abilityModifier = getAbilityModifier(character, character.spellcasting.ability);
  const characterLevel = character.level || 1;
  
  // Paladins and Rangers prepare spells differently
  const lowerClass = (character.class || '').toLowerCase();
  if (lowerClass === 'паладин' || lowerClass === 'следопыт') {
    return Math.max(1, Math.floor(characterLevel / 2) + abilityModifier);
  }
  
  return Math.max(1, characterLevel + abilityModifier);
}

export default SpellCastingPanel;
