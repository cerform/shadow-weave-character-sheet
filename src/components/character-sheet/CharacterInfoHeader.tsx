
import React from 'react';
import { Character } from '@/types/character';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterInfoHeaderProps {
  character: Character;
}

const CharacterInfoHeader: React.FC<CharacterInfoHeaderProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getModifier = (abilityScore: number) => {
    const mod = calculateAbilityModifier(abilityScore);
    return mod >= 0 ? `+${mod}` : mod;
  };
  
  const headerClass = () => {
    if (typeof theme === 'string' && theme in themes) {
      return `bg-gradient-to-r border-b-2 px-4 py-3 rounded-t-md ${character?.class?.toLowerCase() === 'wizard' ? 'wizard-header' : ''}`;
    }
    return `bg-gradient-to-r from-primary/20 to-primary/10 border-b-2 border-accent/50 px-4 py-3 rounded-t-md`;
  };
  
  return (
    <div className={headerClass()} style={{ borderColor: currentTheme.accent }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
            {character.name}
          </h2>
          <div className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            {character.race} {character.subrace ? `(${character.subrace})` : ''} • {character.class} {character.subclass ? `(${character.subclass})` : ''} • Уровень {character.level}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="text-center">
            <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>КД</div>
            <div className="font-bold text-lg" style={{ color: currentTheme.textColor }}>{character.ac}</div>
          </div>
          
          <div className="text-center">
            <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>ХП</div>
            <div className="font-bold text-lg" style={{ color: currentTheme.textColor }}>
              {character.hp}/{character.maxHp}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>Инициатива</div>
            <div className="font-bold text-lg" style={{ color: currentTheme.textColor }}>
              {getModifier(character.abilities.DEX || character.abilities.dexterity || 10)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>Скорость</div>
            <div className="font-bold text-lg" style={{ color: currentTheme.textColor }}>{character.speed}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfoHeader;
