
import React, { useEffect, useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getAbilityModifier } from '@/utils/characterUtils';
import { safeToString } from '@/utils/stringUtils';

interface SpellCastingPanelProps {
  character?: Character;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [dc, setDc] = useState<number>(0);
  const [attackBonus, setAttackBonus] = useState<number>(0);

  useEffect(() => {
    if (!character) return;
    
    // Определяем базовую характеристику для заклинаний
    let abilityMod = 0;
    const characterClass = character.class || '';
    
    // Используем безопасное преобразование к строке для класса
    const classLower = safeToString(characterClass).toLowerCase();
    
    // Интеллект для волшебников, мудрость для жрецов и друидов, харизма для остальных магических классов
    if (classLower.includes('волшебник') || classLower.includes('wizard')) {
      abilityMod = getAbilityModifier(character, 'INT');
    } else if (classLower.includes('жрец') || classLower.includes('cleric') || 
               classLower.includes('друид') || classLower.includes('druid')) {
      abilityMod = getAbilityModifier(character, 'WIS');
    } else {
      abilityMod = getAbilityModifier(character, 'CHA');
    }
    
    const profBonus = character.proficiencyBonus || 2;
    
    // Устанавливаем сложность спасброска
    const spellDc = 8 + profBonus + abilityMod;
    setDc(spellDc);
    
    // Устанавливаем бонус к атаке заклинанием
    const spellAttack = profBonus + abilityMod;
    setAttackBonus(spellAttack);
    
  }, [character]);
  
  // Если персонажа нет, не отображаем компонент
  if (!character) return null;
  
  return (
    <Card className="border-accent/30" style={{ backgroundColor: currentTheme.cardBackground }}>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm" style={{ color: currentTheme.textColor }}>
              Сложность спасброска
            </span>
            <Badge
              className="text-lg py-1 px-4 mt-1"
              style={{ 
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              {dc}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm" style={{ color: currentTheme.textColor }}>
              Бонус к атаке заклинанием
            </span>
            <Badge
              className="text-lg py-1 px-4 mt-1"
              style={{ 
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              +{attackBonus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellCastingPanel;
