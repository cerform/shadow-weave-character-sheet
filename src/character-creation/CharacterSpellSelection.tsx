import React, { useState, useEffect, useCallback } from 'react';
import { SpellData } from '@/types/spells';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Temporary utility functions until proper imports can be fixed
const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character?.class?.toLowerCase() || '';
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10;
    return Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10;
    return Math.floor((intelligence - 10) / 2);
  } else {
    // Харизма (бард, колдун, чародей, паладин)
    const charisma = character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10;
    return Math.floor((charisma - 10) / 2);
  }
};

const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  characterLevel: number,
  abilityModifier: number = 0
): { cantripsCount: number; knownSpells: number; maxSpellLevel: number } => {
  // Значения по умолчанию
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = 0;

  const classLower = characterClass.toLowerCase();

  if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Волшебник
    cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    knownSpells = 6 + (characterLevel > 1 ? (characterLevel - 1) * 2 : 0);
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['жрец', 'cleric'].includes(classLower)) {
    // Жрец
    cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    knownSpells = characterLevel + abilityModifier;
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['бард', 'bard'].includes(classLower)) {
    // Бард
    cantripsCount = 2;
    knownSpells = 4 + Math.floor((characterLevel - 1) / 2);
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['друид', 'druid'].includes(classLower)) {
    // Друид
    cantripsCount = characterLevel >= 4 ? 3 : 2;
    knownSpells = characterLevel + abilityModifier;
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['колдун', 'чародей', 'warlock', 'sorcerer'].includes(classLower)) {
    // Колдун/Чародей
    cantripsCount = characterLevel >= 10 ? 4 : characterLevel >= 4 ? 3 : 2;
    knownSpells = Math.min(15, characterLevel + 1);
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 2));
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Паладин
    cantripsCount = 0;
    knownSpells = Math.floor(characterLevel / 2) + abilityModifier;
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 4));
  } else if (['рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    // Следопыт
    cantripsCount = 0;
    knownSpells = Math.floor(characterLevel / 2);
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 4));
  }

  return { cantripsCount, knownSpells, maxSpellLevel };
};

const filterSpellsByClassAndLevel = (
  spells: SpellData[], 
  characterClass: string, 
  characterLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0) {
    return [];
  }
  
  const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
    const classLower = characterClass.toLowerCase();
    
    if (['волшебник', 'маг', 'wizard', 'жрец', 'cleric', 'бард', 'bard', 'друид', 'druid'].includes(classLower)) {
      return Math.min(9, Math.ceil(characterLevel / 2));
    } else if (['колдун', 'чародей', 'warlock', 'sorcerer'].includes(classLower)) {
      return Math.min(5, Math.ceil(characterLevel / 2));
    } else if (['паладин', 'paladin', 'рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
      return Math.min(5, Math.ceil(characterLevel / 4));
    }
    
    return 0;
  };
  
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Проверка уровня заклинания
    if (spell.level > maxSpellLevel) {
      return false;
    }
    
    // Проверка со��тветствия классу
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        return spell.classes.some(cls => {
          if (typeof cls === 'string') {
            return cls.toLowerCase() === classLower;
          }
          return false;
        });
      } else if (typeof spell.classes === 'string') {
        return spell.classes.toLowerCase() === classLower;
      }
    }
    
    return false;
  });
};

interface CharacterSpellSelectionProps {
  level: number;
  characterClass: string;
  availableSpells: SpellData[];
  onSpellChange: (spell: SpellData, isAdding: boolean) => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  level,
  characterClass,
  availableSpells,
  onSpellChange,
}) => {
  const { character, setCharacter } = useCharacter();
  const { selectedSpells } = useSpellbook();
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получаем модификатор способности для заклинаний
  const abilityModifier = character ? getSpellcastingAbilityModifier(character) : 0;

  // Вычисляем доступные заклинания
  const { maxSpellLevel, cantripsCount, knownSpells } = calculateAvailableSpellsByClassAndLevel(
    characterClass, 
    level,
    abilityModifier
  );

  // Функция для фильтрации заклинаний по поисковому запросу и классу/уровню
  const filterSpells = useCallback(() => {
    if (!availableSpells) return;

    // Фильтруем по классу и уровню
    let classFiltered = filterSpellsByClassAndLevel(availableSpells, characterClass, level);
    
    // Дополнительно фильтруем по поисковому запросу
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      classFiltered = classFiltered.filter(spell => {
        return (
          spell.name.toLowerCase().includes(searchLower) ||
          spell.school.toLowerCase().includes(searchLower) ||
          (Array.isArray(spell.description) ? 
            spell.description.join(' ').toLowerCase().includes(searchLower) : 
            String(spell.description).toLowerCase().includes(searchLower))
        );
      });
    }
    
    setFilteredSpells(classFiltered);
  }, [availableSpells, characterClass, level, searchTerm]);

  useEffect(() => {
    filterSpells();
  }, [filterSpells]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Проверяем, изучено ли заклинание
  const isSpellKnown = (spell: SpellData) => {
    return character.spells && character.spells.some(s => {
      if (typeof s === 'string') return s === spell.name;
      return s.id === spell.id || s.name === spell.name;
    });
  };

  // Обработчик добавления/удаления заклинания
  const handleSpellChange = (spell: SpellData, adding: boolean) => {
    onSpellChange(spell, adding);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold" style={{color: currentTheme.textColor}}>Выберите заклинания</h4>
        <p className="text-sm text-muted-foreground" style={{color: currentTheme.mutedTextColor}}>
          Уровень: {level}, Класс: {characterClass}
          <br />
          Известно заговоров: {cantripsCount}, Известно заклинаний: {knownSpells}, Макс. уровень заклинаний: {maxSpellLevel}
        </p>
        <Separator className="my-2 bg-accent/30" />
        <input
          type="text"
          placeholder="Поиск заклинаний..."
          className="w-full p-2 border rounded"
          onChange={handleSearchChange}
          style={{
            backgroundColor: currentTheme.cardBackground,
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredSpells.length > 0 ? (
            filteredSpells.map((spell) => (
              <Card key={spell.id} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                <CardContent className="flex items-center justify-between p-3">
                  <div style={{color: currentTheme.textColor}}>
                    {spell.name} ({spell.school}, {spell.level === 0 ? 'Заговор' : spell.level})
                  </div>
                  <Badge
                    variant="outline"
                    onClick={() => handleSpellChange(spell, !isSpellKnown(spell))}
                    style={{
                      backgroundColor: isSpellKnown(spell) ? currentTheme.background : currentTheme.accent,
                      color: isSpellKnown(spell) ? currentTheme.accent : currentTheme.textColor,
                      cursor: 'pointer',
                    }}
                  >
                    {isSpellKnown(spell) ? 'Известно' : 'Изучить'}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? 'Заклинания по запросу не найдены.' : 'Нет доступных заклинаний для данного класса и уровня.'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CharacterSpellSelection;
