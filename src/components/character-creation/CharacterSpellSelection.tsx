
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpellData } from '@/types/spells';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { getAllSpells } from '@/data/spells';

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
  const { selectedSpells, availableSpells: contextAvailableSpells, addSpell, removeSpell, getSpellLimits, getSelectedSpellCount, saveCharacterSpells } = useSpellbook();
  
  // Use props or derived values
  const effectiveLevel = level || character.level || 1;
  const effectiveClass = characterClass || character.class || '';
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [directFilteredSpells, setDirectFilteredSpells] = useState<SpellData[]>([]);

  // Загружаем заклинания напрямую из данных при монтировании или изменении класса/уровня
  useEffect(() => {
    const loadSpellsDirectly = () => {
      if (!effectiveClass) return;
      
      setLoading(true);
      console.log(`Loading spells directly for ${effectiveClass} (level ${effectiveLevel})`);
      
      try {
        // Получаем все заклинания
        const allSpells = getAllSpells();
        console.log(`Total spells available: ${allSpells.length}`);
        
        // Вычисляем максимальный уровень заклинаний
        const maxSpellLevel = Math.ceil(effectiveLevel / 2);
        console.log(`Maximum spell level: ${maxSpellLevel}`);
        
        // Фильтруем заклинания для указанного класса и уровня
        const filteredSpells = allSpells.filter(spell => {
          // Проверяем, подходит ли заклинание для данного класса
          let spellClasses: string[] = [];
          if (typeof spell.classes === 'string') {
            spellClasses = [spell.classes.toLowerCase()];
          } else if (Array.isArray(spell.classes)) {
            spellClasses = spell.classes.map(c => c.toLowerCase());
          }
          
          // Проверяем соответствие класса и уровня
          const matchesClass = spellClasses.some(cls => 
            cls === effectiveClass.toLowerCase() || 
            (effectiveClass.toLowerCase() === 'жрец' && cls === 'cleric') ||
            (effectiveClass.toLowerCase() === 'волшебник' && cls === 'wizard') ||
            (effectiveClass.toLowerCase() === 'друид' && cls === 'druid') ||
            (effectiveClass.toLowerCase() === 'бард' && cls === 'bard') ||
            (effectiveClass.toLowerCase() === 'колдун' && cls === 'warlock') ||
            (effectiveClass.toLowerCase() === 'чародей' && cls === 'sorcerer') ||
            (effectiveClass.toLowerCase() === 'паладин' && cls === 'paladin')
          );
          
          // Проверяем, не превышает ли уровень заклинания максимальный доступный уровень
          const levelIsValid = spell.level <= maxSpellLevel;
          
          return matchesClass && levelIsValid;
        });
        
        console.log(`Found ${filteredSpells.length} spells for ${effectiveClass}`);
        setDirectFilteredSpells(filteredSpells);
      } catch (error) {
        console.error("Error loading spells:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSpellsDirectly();
  }, [effectiveClass, effectiveLevel]);

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

  // Определяем список заклинаний для отображения, используя все доступные источники
  const availableSpellsToShow = useMemo(() => {
    // Приоритет: 1. пропсы, 2. напрямую отфильтрованные, 3. контекст
    if (propAvailableSpells && propAvailableSpells.length > 0) {
      console.log("Using spells from props:", propAvailableSpells.length);
      return propAvailableSpells;
    }
    
    if (directFilteredSpells.length > 0) {
      console.log("Using directly filtered spells:", directFilteredSpells.length);
      return directFilteredSpells;
    }
    
    if (contextAvailableSpells && Array.isArray(contextAvailableSpells) && contextAvailableSpells.length > 0) {
      console.log("Using spells from context:", contextAvailableSpells.length);
      return contextAvailableSpells;
    }
    
    console.log("No spells available");
    return [];
  }, [propAvailableSpells, directFilteredSpells, contextAvailableSpells]);

  // Функция для фильтрации заклинаний по поисковому запросу
  useEffect(() => {
    if (!availableSpellsToShow || availableSpellsToShow.length === 0) {
      setFilteredSpells([]);
      return;
    }

    console.log(`Filtering ${availableSpellsToShow.length} spells with search term: '${searchTerm}'`);
    
    if (!searchTerm) {
      setFilteredSpells(availableSpellsToShow);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = availableSpellsToShow.filter(spell => {
      const nameMatch = spell.name.toLowerCase().includes(searchTermLower);
      const schoolMatch = spell.school?.toLowerCase().includes(searchTermLower) || false;
      const descMatch = Array.isArray(spell.description) 
        ? spell.description.join(' ').toLowerCase().includes(searchTermLower)
        : (spell.description || '').toLowerCase().includes(searchTermLower);
      
      return nameMatch || schoolMatch || descMatch;
    });
    
    console.log(`Filter results: ${filtered.length} spells match criteria`);
    setFilteredSpells(filtered);
  }, [availableSpellsToShow, searchTerm]);

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Проверяем, изучено ли заклинание
  const isSpellKnown = useCallback((spell: SpellData) => {
    if (!character.spells || !Array.isArray(character.spells)) return false;
    
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
              {availableSpellsToShow.length === 0 
                ? `Нет доступных заклинаний для класса ${effectiveClass}` 
                : "Заклинания не найдены по запросу"}
            </div>
          ) : (
            filteredSpells.map((spell) => {
              const isAdded = isSpellKnown(spell);
              const canAdd = spell.level === 0 
                ? spellCounts.cantrips < cantripsCount 
                : spellCounts.spells < knownSpells;
              
              return (
                <Card key={spell.id || spell.name} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div style={{color: currentTheme.textColor}}>
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-xs">{spell.school || "Универсальная"}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}</div>
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
