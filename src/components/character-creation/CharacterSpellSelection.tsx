
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
import { Character, CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { getAllSpells, getSpellsByClass } from '@/data/spells';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { selectedSpells, loadSpells } = useSpellbook();
  const { toast } = useToast();
  
  // Use props or derived values
  const effectiveLevel = level || character.level || 1;
  const effectiveClass = characterClass || character.class || '';
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [internalAvailableSpells, setInternalAvailableSpells] = useState<SpellData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [cantripsKnown, setCantripsKnown] = useState(0);
  const [spellsKnown, setSpellsKnown] = useState(0);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [loadedSuccessfully, setLoadedSuccessfully] = useState(false);

  // Загружаем заклинания напрямую из данных при монтировании или изменении класса/уровня
  useEffect(() => {
    if (effectiveClass && !loadedSuccessfully && loadAttempts < 3) {
      setLoading(true);
      setLoadAttempts(prev => prev + 1);
      
      try {
        console.log(`Loading spells for ${effectiveClass} (level ${effectiveLevel})`);
        
        // Резервная загрузка заклинаний напрямую из данных
        const classSpells = getSpellsByClass(effectiveClass);
        console.log(`Direct loading found ${classSpells.length} spells for ${effectiveClass}`);
        
        if (classSpells.length > 0) {
          // Преобразуем заклинания к типу SpellData и устанавливаем максимальный уровень
          const maxSpellLevel = Math.ceil(effectiveLevel / 2);
          const filteredSpells = classSpells
            .filter(spell => spell.level <= maxSpellLevel)
            .map(spell => ({
              id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
              name: spell.name,
              level: spell.level,
              school: spell.school || 'Универсальная',
              castingTime: spell.castingTime || '1 действие',
              range: spell.range || 'На себя',
              components: spell.components || '',
              duration: spell.duration || 'Мгновенная',
              description: spell.description || ['Нет описания'],
              classes: spell.classes || [],
              ritual: spell.ritual || false,
              concentration: spell.concentration || false
            } as SpellData));
          
          if (filteredSpells.length > 0) {
            console.log(`Setting ${filteredSpells.length} internal spells`);
            setInternalAvailableSpells(filteredSpells);
            setLoadedSuccessfully(true);
          }
        }
      } catch (error) {
        console.error("Error loading spells:", error);
      } finally {
        // Даем время на загрузку
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
  }, [effectiveClass, effectiveLevel, loadAttempts, loadedSuccessfully]);

  // Пересчитываем количество известных заклинаний при каждом изменении списка заклинаний
  useEffect(() => {
    if (character.spells) {
      const cantripsCount = character.spells.filter(spell => {
        if (typeof spell === 'string') return false;
        return spell.level === 0;
      }).length;
      
      const spellsCount = character.spells.filter(spell => {
        if (typeof spell === 'string') return false;
        return spell.level > 0;
      }).length;
      
      setCantripsKnown(cantripsCount);
      setSpellsKnown(spellsCount);
    } else {
      setCantripsKnown(0);
      setSpellsKnown(0);
    }
  }, [character.spells]);

  // Получаем модификатор характеристики
  const getModifierForClass = useCallback(() => {
    if (!character || !character.abilities) return 3; // По умолчанию +3
    
    const classLower = character.class ? character.class.toLowerCase() : "";
    
    if (['жрец', 'друид'].includes(classLower)) {
      // Мудрость
      return Math.floor((character.abilities.wisdom || character.wisdom || 10) - 10) / 2;
    } else if (['волшебник', 'маг', 'изобретатель'].includes(classLower)) {
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

  // Определяем список заклинаний для отображения - используем все доступные источники
  const spellsToFilter = useMemo(() => {
    // Приоритет: 1. пропсы, 2. загруженные напрямую
    if (propAvailableSpells && propAvailableSpells.length > 0) {
      return propAvailableSpells;
    } 
    
    if (internalAvailableSpells.length > 0) {
      return internalAvailableSpells;
    }
    
    return [];
  }, [propAvailableSpells, internalAvailableSpells]);

  // Фильтрация по поисковому запросу и активной вкладке
  useEffect(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) {
      setFilteredSpells([]);
      return;
    }

    let filtered = spellsToFilter;
    
    // Фильтрация по поисковому запросу, если он есть
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = spellsToFilter.filter(spell => {
        const nameMatch = spell.name.toLowerCase().includes(searchTermLower);
        
        // Безопасная обработка свойства school с проверкой типа
        let schoolMatch = false;
        if (spell.school && typeof spell.school === 'string') {
          schoolMatch = spell.school.toLowerCase().includes(searchTermLower);
        }
        
        // Безопасная проверка типа description
        let descMatch = false;
        if (spell.description) {
          if (Array.isArray(spell.description)) {
            descMatch = spell.description.join(' ').toLowerCase().includes(searchTermLower);
          } else if (typeof spell.description === 'string') {
            descMatch = spell.description.toLowerCase().includes(searchTermLower);
          }
        }
        
        return nameMatch || schoolMatch || descMatch;
      });
    }
    
    // Фильтрация по выбранному уровню (вкладке)
    if (activeTab !== 'all') {
      const level = activeTab === 'cantrips' ? 0 : parseInt(activeTab, 10);
      filtered = filtered.filter(spell => spell.level === level);
    }
    
    setFilteredSpells(filtered);
  }, [spellsToFilter, searchTerm, activeTab]);

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
      return;
    }
    
    if (adding) {
      // Проверяем лимиты заклинаний
      if (spell.level === 0 && cantripsKnown >= cantripsCount) {
        toast({
          title: "Лимит заговоров",
          description: "Вы достигли максимального количества известных заговоров",
          variant: "destructive"
        });
        return;
      }
      
      if (spell.level > 0 && spellsKnown >= knownSpells) {
        toast({
          title: "Лимит заклинаний",
          description: "Вы достигли максимального количества известных заклинаний",
          variant: "destructive"
        });
        return;
      }
      
      // Также добавляем заклинание прямо в персонажа
      addSpellToCharacter(spell);
      
      // Обновляем счетчики
      if (spell.level === 0) {
        setCantripsKnown(prev => prev + 1);
      } else {
        setSpellsKnown(prev => prev + 1);
      }
    } else {
      // Также удаляем заклинание из персонажа
      removeSpellFromCharacter(spell);
      
      // Обновляем счетчики
      if (spell.level === 0) {
        setCantripsKnown(prev => Math.max(0, prev - 1));
      } else {
        setSpellsKnown(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Обработчик сохранения и перехода к следующему шагу
  const handleSaveAndContinue = () => {
    if (nextStep) nextStep();
  };

  // Получаем уникальные уровни заклинаний для создания вкладок
  const spellLevels = useMemo(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) return [];
    return [...new Set(spellsToFilter.map(spell => spell.level))].sort((a, b) => a - b);
  }, [spellsToFilter]);

  // Группировка заклинаний по уровням для меток на вкладках
  const spellCountsByLevel = useMemo(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) return {};
    
    return spellsToFilter.reduce((acc: Record<string, number>, spell) => {
      const level = spell.level;
      if (level !== undefined) {
        acc[level.toString()] = (acc[level.toString()] || 0) + 1;
      }
      return acc;
    }, {});
  }, [spellsToFilter]);

  // Если не удалось загрузить заклинания после нескольких попыток
  if (loadAttempts >= 3 && !loadedSuccessfully && !loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-8 text-red-400">
          <h3 className="text-xl font-bold mb-3">Не удалось загрузить заклинания</h3>
          <p className="mb-4">Произошла ошибка при загрузке списка заклинаний для класса {effectiveClass}.</p>
          <Button 
            onClick={() => {
              setLoadAttempts(0);
              setLoading(true);
            }}
            className="bg-primary mx-auto"
          >
            Попробовать снова
          </Button>
        </div>
        
        {nextStep && prevStep && (
          <div className="mt-auto pt-4">
            <NavigationButtons 
              onPrev={prevStep} 
              onNext={nextStep}
              nextLabel="Пропустить выбор заклинаний"
            />
          </div>
        )}
      </div>
    );
  }

  // Функция для добавления заклинания
  const addSpellToCharacter = (spell: SpellData) => {
    // Проверяем, есть ли заклинание уже у персонажа
    const spellExists = character.spells && character.spells.some(s => {
      if (typeof s === 'string') return s === spell.name;
      return s.name === spell.name;
    });

    if (spellExists) return;

    // Конвертируем SpellData в CharacterSpell
    const newSpell: CharacterSpell = {
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      classes: spell.classes,
      ritual: spell.ritual,
      concentration: spell.concentration,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      prepared: spell.level === 0 // Заговоры всегда подготовлены
    };

    // Добавляем заклинание к персонажу
    const updatedSpells: CharacterSpell[] = [...(character.spells || [])];
    updatedSpells.push(newSpell);
    
    // Обновляем персонажа с нормализованными заклинаниями
    updateCharacter({ spells: updatedSpells });
  };

  // Функция для удаления заклинания
  const removeSpellFromCharacter = (spellToRemove: SpellData) => {
    if (!character.spells) return;

    // Удаляем заклинание из списка
    const updatedSpells = character.spells.filter(spell => {
      if (typeof spell === 'string') return spell !== spellToRemove.name;
      return spell.name !== spellToRemove.name;
    });

    // Обновляем персонажа
    updateCharacter({ spells: updatedSpells });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold" style={{color: currentTheme.textColor}}>Выберите заклинания</h4>
        <p className="text-sm text-muted-foreground" style={{color: currentTheme.mutedTextColor}}>
          Уровень: {effectiveLevel}, Класс: {effectiveClass}
          <br />
          <span className={Number(cantripsKnown) >= cantripsCount ? "text-red-500 font-bold" : ""}>
            Известно заговоров: {cantripsKnown}/{cantripsCount}
          </span>, 
          <span className={Number(spellsKnown) >= knownSpells ? "text-red-500 font-bold" : ""}> 
            Известно заклинаний: {spellsKnown}/{knownSpells}
          </span>, 
          Макс. уровень заклинаний: {maxSpellLevel}
        </p>
        <Separator className="my-2 bg-accent/30" />
        <input
          type="text"
          placeholder="Поиск заклинаний..."
          className="w-full p-2 border rounded mb-4"
          onChange={handleSearchChange}
          style={{
            backgroundColor: currentTheme.cardBackground,
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 flex flex-wrap">
            <TabsTrigger value="all">
              Все ({spellsToFilter.length})
            </TabsTrigger>
            <TabsTrigger value="cantrips">
              Заговоры ({spellCountsByLevel['0'] || 0})
            </TabsTrigger>
            {spellLevels.filter(level => typeof level === 'number' && level > 0).map(level => (
              <TabsTrigger key={`level-${level}`} value={String(level)}>
                {level} уровень ({spellCountsByLevel[String(level)] || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-2 p-1">
              {filteredSpells.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {spellsToFilter.length === 0 
                    ? 'Нет доступных заклинаний для этого класса' 
                    : 'Нет заклинаний, соответствующих фильтру'}
                </div>
              ) : (
                filteredSpells.map(spell => {
                  const known = isSpellKnown(spell);
                  return (
                    <Card 
                      key={spell.id || spell.name}
                      style={{
                        backgroundColor: known ? `${currentTheme.accent}20` : currentTheme.cardBackground,
                        borderColor: known ? currentTheme.accent : currentTheme.borderColor
                      }}
                    >
                      <CardContent className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                            </Badge>
                            {spell.school && (
                              <span className="text-muted-foreground">{spell.school}</span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          variant={known ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => handleSpellChange(spell, !known)}
                        >
                          {known ? 'Изучено' : 'Добавить'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {nextStep && prevStep && (
        <div className="mt-auto pt-4">
          <NavigationButtons 
            onPrev={prevStep}
            onNext={handleSaveAndContinue}
            nextDisabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default CharacterSpellSelection;
