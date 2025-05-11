
import React from 'react';
import { Character } from '@/types/character';
import { getAbilityModifier } from '@/utils/characterUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character, onUpdate }) => {
  const spellcastingAbilities = [
    { value: 'intelligence', label: 'Интеллект' },
    { value: 'wisdom', label: 'Мудрость' },
    { value: 'charisma', label: 'Харизма' }
  ];

  const handleAbilityChange = (value: string) => {
    // Update spellcasting ability
    const ability = value as 'intelligence' | 'wisdom' | 'charisma';
    
    // Calculate spell save DC: 8 + proficiency bonus + ability modifier
    const abilityKey = ability === 'intelligence' ? 'INT' : 
                       ability === 'wisdom' ? 'WIS' : 'CHA';
                       
    // Make sure to pass character as both the first and second arguments
    const abilityModifier = getAbilityModifier(character, abilityKey);
    const profBonus = character.proficiencyBonus || 2;
    const spellDC = 8 + profBonus + abilityModifier;
    
    // Calculate spell attack bonus: proficiency bonus + ability modifier
    const spellAttack = profBonus + abilityModifier;
    
    // Calculate prepared spells limit (usually level + ability modifier)
    const preparedLimit = (character.level || 1) + abilityModifier;
    
    onUpdate({
      spellcasting: {
        ability,
        dc: spellDC,
        attack: spellAttack,
        preparedSpellsLimit: preparedLimit
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заклинания</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="spellcasting-ability">Базовая характеристика</Label>
          <Select 
            value={character.spellcasting?.ability || 'intelligence'} 
            onValueChange={handleAbilityChange}
          >
            <SelectTrigger id="spellcasting-ability">
              <SelectValue placeholder="Выберите характеристику" />
            </SelectTrigger>
            <SelectContent>
              {spellcastingAbilities.map(ability => (
                <SelectItem key={ability.value} value={ability.value}>
                  {ability.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold">{character.spellcasting?.dc || 10}</div>
            <div className="text-sm text-muted-foreground">Сложность заклинаний</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold">+{character.spellcasting?.attack || 2}</div>
            <div className="text-sm text-muted-foreground">Бонус атаки</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold">{character.spellcasting?.preparedSpellsLimit || 0}</div>
            <div className="text-sm text-muted-foreground">Макс. подготовлено</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
