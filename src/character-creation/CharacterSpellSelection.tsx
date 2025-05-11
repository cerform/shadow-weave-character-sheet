
import React, { useState, useEffect, useCallback } from 'react';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { calculateAvailableSpellsByClassAndLevel, filterSpellsByClassAndLevel } from '@/utils/spellUtils';
import { getSpellcastingAbilityModifier } from '@/utils/spellUtils';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme, ThemeType } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

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
  const themeKey = (theme || 'default') as ThemeType;
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
    let classFiltered = filterSpellsByClassAndLevel(availableSpells, characterClass, maxSpellLevel);
    
    // Дополнительно фильтруем по поисковому запросу
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      classFiltered = classFiltered.filter(spell => {
        return (
          spell.name.toLowerCase().includes(searchLower) ||
          (spell.school || '').toLowerCase().includes(searchLower) ||
          (Array.isArray(spell.description) ? 
            spell.description.join(' ').toLowerCase().includes(searchLower) : 
            String(spell.description || '').toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Convert CharacterSpell[] to SpellData[] to fix type issue
    setFilteredSpells(classFiltered.map(spell => {
      // Ensure each spell conforms to SpellData interface
      return {
        id: spell.id,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'На себя',
        components: spell.components || '',
        duration: spell.duration || 'Мгновенная',
        description: spell.description || '',
        classes: spell.classes,
        verbal: spell.verbal,
        somatic: spell.somatic,
        material: spell.material,
        ritual: spell.ritual,
        concentration: spell.concentration,
        prepared: spell.prepared
      };
    }));
  }, [availableSpells, characterClass, maxSpellLevel, searchTerm]);

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
            backgroundColor: currentTheme.background,
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredSpells.length > 0 ? (
            filteredSpells.map((spell) => (
              <Card key={spell.id} style={{backgroundColor: currentTheme.background, borderColor: currentTheme.accent}}>
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
