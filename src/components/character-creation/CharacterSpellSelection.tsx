
import React, { useState, useEffect, useCallback } from 'react';
import { SpellData } from '@/types/spells';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';

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
  const { selectedSpells, getSpellLimits, getSelectedSpellCount } = useSpellbook();
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получаем модификатор характеристики
  const getModifierForClass = useCallback(() => {
    if (!character || !character.abilities) return 3; // По умолчанию +3
    
    const classLower = character.class?.toLowerCase();
    
    if (['жрец', 'друид'].includes(classLower || '')) {
      // Мудрость
      return Math.floor((character.wisdom - 10) / 2);
    } else if (['волшебник', 'маг'].includes(classLower || '')) {
      // Интеллект
      return Math.floor((character.intelligence - 10) / 2);
    } else {
      // Харизма (бард, колдун, чародей, паладин)
      return Math.floor((character.charisma - 10) / 2);
    }
  }, [character]);

  // Вычисляем доступные заклинания с учетом модификатора характеристики
  const spellLimits = useCallback(() => {
    return calculateAvailableSpellsByClassAndLevel(
      characterClass, 
      level,
      getModifierForClass()
    );
  }, [characterClass, level, getModifierForClass]);

  // Отображаем информацию о лимитах
  const { maxSpellLevel, cantripsCount, knownSpells } = spellLimits();
  
  // Получаем текущие количества заклинаний
  const spellCounts = getSelectedSpellCount();

  // Функция для фильтрации заклинаний по поисковому запросу
  const filterSpells = useCallback(() => {
    if (!availableSpells) return;

    console.log(`Filtering spells. Total available: ${availableSpells.length}`);
    
    let filtered = availableSpells.filter(spell => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = spell.name.toLowerCase().includes(searchTermLower);
      const schoolMatch = spell.school?.toLowerCase().includes(searchTermLower) || false;
      const descMatch = Array.isArray(spell.description) 
        ? spell.description.join(' ').toLowerCase().includes(searchTermLower)
        : (spell.description || '').toLowerCase().includes(searchTermLower);
      
      return nameMatch || schoolMatch || descMatch;
    });

    console.log(`After filtering: ${filtered.length} spells match criteria`);
    setFilteredSpells(filtered);
  }, [availableSpells, searchTerm]);

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
          Известно заговоров: {spellCounts.cantrips}/{cantripsCount}, Известно заклинаний: {spellCounts.spells}/{knownSpells}, Макс. уровень заклинаний: {maxSpellLevel}
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
          {filteredSpells.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {availableSpells.length === 0 
                ? "Загрузка заклинаний..." 
                : "Заклинания не найдены."}
            </div>
          ) : (
            filteredSpells.map((spell) => {
              const isAdded = isSpellKnown(spell);
              const canAdd = spell.level === 0 
                ? spellCounts.cantrips < cantripsCount 
                : spellCounts.spells < knownSpells;
              
              return (
                <Card key={spell.id} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div style={{color: currentTheme.textColor}}>
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-xs">{spell.school}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}</div>
                    </div>
                    <Button
                      variant={isAdded ? "default" : "outline"}
                      disabled={!isAdded && !canAdd}
                      onClick={() => handleSpellChange(spell, !isAdded)}
                      style={{
                        backgroundColor: isAdded ? currentTheme.accent : currentTheme.background,
                        color: isAdded ? currentTheme.background : currentTheme.accent,
                      }}
                    >
                      {isAdded ? 'Известно' : 'Изучить'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CharacterSpellSelection;
