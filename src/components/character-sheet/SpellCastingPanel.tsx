
import React from 'react';
import { Character } from '@/types/character';
import { getDefaultCastingAbility, calculateSpellcastingDC, calculateSpellAttackBonus } from '@/utils/spellUtils';

interface SpellCastingPanelProps {
  character: Character;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character }) => {
  // Получение базовой характеристики заклинаний
  const getCastingAbilityName = (abilityCode: string): string => {
    switch (abilityCode) {
      case 'charisma': return 'Харизма';
      case 'intelligence': return 'Интеллект';
      case 'wisdom': return 'Мудрость';
      default: return 'Неизвестно';
    }
  };
  
  // Получение информации о заклинаниях персонажа
  const castingAbility = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  const spellSaveDC = calculateSpellcastingDC(character);
  const spellAttackBonus = calculateSpellAttackBonus(character);
  
  // Проверка есть ли заклинания
  const hasSpells = character.spells && character.spells.length > 0;
  
  if (!hasSpells) {
    return null;
  }
  
  // Преобразование строковых заклинаний в объекты
  const normalizeSpells = () => {
    return (character.spells || []).map(spell => {
      if (typeof spell === 'string') {
        return {
          id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
          name: spell,
          level: 0,
          school: 'Универсальная',
          prepared: true
        };
      }
      return spell;
    });
  };
  
  const spells = normalizeSpells();
  
  // Группировка заклинаний по уровням
  const spellsByLevel = spells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, typeof spells>);
  
  return (
    <div className="bg-card/60 rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Заклинательная способность</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Базовая характеристика</p>
          <p className="font-medium">{getCastingAbilityName(castingAbility)}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Сложность спасброска</p>
          <p className="font-medium">{spellSaveDC}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Бонус атаки</p>
          <p className="font-medium">+{spellAttackBonus}</p>
        </div>
      </div>
    </div>
  );
};

export default SpellCastingPanel;
