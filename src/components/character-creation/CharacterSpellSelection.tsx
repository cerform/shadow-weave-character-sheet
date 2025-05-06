
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
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
  level?: number;
  characterClass?: string;
  availableSpells?: SpellData[];
  onSpellChange?: (spell: SpellData, isAdding: boolean) => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
  level,
  characterClass,
  availableSpells: propAvailableSpells,
  onSpellChange: propOnSpellChange,
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { selectedSpells, availableSpells: contextAvailableSpells, addSpell, removeSpell, getSpellLimits, getSelectedSpellCount, saveCharacterSpells, loadSpellsForCharacter } = useSpellbook();
  
  // Use props or derived values
  const effectiveLevel = level || character.level || 1;
  const effectiveClass = characterClass || character.class || '';
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Эффект для загрузки заклинаний при монтировании или изменении класса/уровня
  useEffect(() => {
    if (effectiveClass) {
      setLoading(true);
      console.log(`Loading spells for ${effectiveClass} (level ${effectiveLevel})`);
      
      // Принудительно загружаем заклинания
      loadSpellsForCharacter(effectiveClass, effectiveLevel);
      
      // Даем время на загрузку
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [effectiveClass, effectiveLevel, loadSpellsForCharacter]);

  // Получаем модификатор характеристики
  const getModifierForClass = useCallback(() => {
    if (!character || !character.abilities) return 3; // По умолчанию +3
    
    const classLower = character.class?.toLowerCase() || '';
    
    if (['жрец', 'друид'].includes(classLower)) {
      // Мудрость
      return Math.floor((character.abilities.wisdom || character.wisdom || 10) - 10) / 2;
    } else if (['волшебник', 'маг'].includes(classLower)) {
      // Интеллект
      return Math.floor((character.abilities.intelligence || character.intelligence || 10) - 10) / 2;
    } else {
      // Харизма (бард, колдун, чародей, паладин)
      return Math.floor((character.abilities.charisma || character.charisma || 10) - 10) / 2;
    }
  }, [character]);

  // Вычисляем доступные заклинания с учетом модификатора характеристики
  const spellLimits = useCallback(() => {
    return calculateAvailableSpellsByClassAndLevel(
      effectiveClass, 
      effectiveLevel,
      getModifierForClass()
    );
  }, [effectiveClass, effectiveLevel, getModifierForClass]);

  // Отображаем информацию о лимитах
  const { maxSpellLevel, cantripsCount, knownSpells } = spellLimits();
  
  // Получаем текущие количества заклинаний
  const spellCounts = getSelectedSpellCount();

  // Функция для фильтрации заклинаний по поисковому запросу
  const filterSpells = useCallback(() => {
    // Используем доступные заклинания из контекста
    const effectiveAvailableSpells = propAvailableSpells || contextAvailableSpells;
    
    if (!effectiveAvailableSpells || effectiveAvailableSpells.length === 0) {
      console.log("No spells available for filtering");
      setFilteredSpells([]);
      return;
    }

    console.log(`Filtering spells. Total available: ${effectiveAvailableSpells.length}`);
    
    let filtered = effectiveAvailableSpells.filter(spell => {
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
  }, [propAvailableSpells, contextAvailableSpells, searchTerm]);

  // Обновляем отфильтрованные заклинания при изменении доступных
  useEffect(() => {
    filterSpells();
  }, [filterSpells, contextAvailableSpells]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Проверяем, изучено ли заклинание
  const isSpellKnown = useCallback((spell: SpellData) => {
    if (!character.spells) return false;
    
    return character.spells.some(s => {
      if (typeof s === 'string') return s === spell.name;
      return s.id === spell.id || s.name === spell.name;
    });
  }, [character.spells]);

  // Обработчик добавления/удаления заклинания
  const handleSpellChange = (spell: SpellData, adding: boolean) => {
    if (propOnSpellChange) {
      propOnSpellChange(spell, adding);
    } else {
      if (adding) {
        addSpell(spell);
      } else {
        removeSpell(spell.id.toString());
      }
    }
  };

  // Обработчик сохранения и перехода к следующему шагу
  const handleSaveAndContinue = () => {
    saveCharacterSpells();
    if (nextStep) nextStep();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold" style={{color: currentTheme.textColor}}>Выберите заклинания</h4>
        <p className="text-sm text-muted-foreground" style={{color: currentTheme.mutedTextColor}}>
          Уровень: {effectiveLevel}, Класс: {effectiveClass}
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
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Загрузка заклинаний...
            </div>
          ) : filteredSpells.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {contextAvailableSpells.length === 0 
                ? "Нет доступных заклинаний для этого класса" 
                : "Заклинания не найдены"}
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

      {nextStep && prevStep && (
        <div className="mt-4">
          <NavigationButtons 
            onPrev={prevStep} 
            onNext={handleSaveAndContinue}
            nextLabel="Сохранить и продолжить"
          />
        </div>
      )}
    </div>
  );
};

export default CharacterSpellSelection;
