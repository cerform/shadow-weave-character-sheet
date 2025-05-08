import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpellData } from '@/types/spells';
import { calculateAvailableSpellsByClassAndLevel, safelyConvertSpellDescription, safelyConvertSpellClasses } from '@/utils/spellUtils';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { getAllSpells, getSpellsByClass } from '@/data/spells';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
  const [themeStyles, setThemeStyles] = useState(currentTheme);
  
  // Fix the string | string[] issue - ensure we handle both cases
  const convertClassesToArray = (classes: string | string[] | undefined): string[] => {
    if (!classes) return [];
    if (typeof classes === 'string') return [classes];
    return classes;
  };

  // Load spells directly from data on mount or when class/level changes
  useEffect(() => {
    if (effectiveClass && !loadedSuccessfully && loadAttempts < 3) {
      setLoading(true);
      setLoadAttempts(prev => prev + 1);
      
      try {
        console.log(`Loading spells for ${effectiveClass} (level ${effectiveLevel})`);
        
        // Prune spells to only those that are available for the class and level
        const classSpells = getSpellsByClass(effectiveClass);
        console.log(`Direct loading found ${classSpells.length} spells for ${effectiveClass}`);
        
        if (classSpells.length > 0) {
          // Convert spells to SpellData and set the maximum level
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
              classes: convertClassesToArray(spell.classes) || [],
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
        // Give time for loading
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
  }, [effectiveClass, effectiveLevel, loadSpellsForCharacter, loadedSuccessfully, loadAttempts]);

  // Recalculate known spells count on spells list changes
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

  // Get modifier for class
  const getModifierForClass = useCallback(() => {
    if (!character || !character.abilities) return 3; // By default +3
    
    const classLower = character.class ? character.class.toLowerCase() : "";
    
    if (['жрец', 'друид'].includes(classLower)) {
      // Wisdom
      return Math.floor((character.abilities.wisdom || character.wisdom || 10) - 10) / 2;
    } else if (['волшебник', 'маг', 'изобретатель'].includes(classLower)) {
      // Intelligence
      return Math.floor((character.abilities.intelligence || character.intelligence || 10) - 10) / 2;
    } else {
      // Charisma (bard, sorcerer, cleric, paladin)
      return Math.floor((character.abilities.charisma || character.charisma || 10) - 10) / 2;
    }
  }, [character]);

  // Calculate available spells based on class modifier
  const spellLimits = useCallback(() => {
    return calculateAvailableSpellsByClassAndLevel(
      effectiveClass, 
      effectiveLevel,
      getModifierForClass()
    );
  }, [effectiveClass, effectiveLevel, getModifierForClass]);

  // Display limit info
  const { maxSpellLevel, cantripsCount, knownSpells } = spellLimits();

  // Determine spells list for display - use all available sources
  const spellsToFilter = useMemo(() => {
    // Priority: 1. props, 2. loaded directly, 3. context
    if (propAvailableSpells && propAvailableSpells.length > 0) {
      return propAvailableSpells;
    } 
    
    if (internalAvailableSpells.length > 0) {
      return internalAvailableSpells;
    }
    
    if (contextAvailableSpells && contextAvailableSpells.length > 0) {
      return contextAvailableSpells;
    }
    
    return [];
  }, [propAvailableSpells, contextAvailableSpells, internalAvailableSpells]);

  // Filter by search term and active tab
  useEffect(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) {
      setFilteredSpells([]);
      return;
    }

    let filtered = spellsToFilter;
    
    // Filter by search term, if it exists
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = spellsToFilter.filter(spell => {
        const nameMatch = spell.name.toLowerCase().includes(searchTermLower);
        
        // Safe handling of school property with type checking
        let schoolMatch = false;
        if (spell.school && typeof spell.school === 'string') {
          schoolMatch = spell.school.toLowerCase().includes(searchTermLower);
        }
        
        // Safe handling of description type
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
    
    // Filter by selected level (tab)
    if (activeTab !== 'all') {
      const level = activeTab === 'cantrips' ? 0 : Number(activeTab);
      filtered = filtered.filter(spell => spell.level === level);
    }
    
    setFilteredSpells(filtered);
  }, [spellsToFilter, searchTerm, activeTab]);

  // Search term change handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Check if spell is already known
  const isSpellKnown = useCallback((spell: SpellData) => {
    if (!character.spells || !Array.isArray(character.spells)) return false;
    
    return character.spells.some(s => {
      if (typeof s === 'string') return s === spell.name;
      return s.id === spell.id || s.name === spell.name;
    });
  }, [character.spells]);

  // Add/remove spell handler
  const handleSpellChange = (spell: SpellData, adding: boolean) => {
    if (propOnSpellChange) {
      propOnSpellChange(spell, adding);
      return;
    }
    
    if (adding) {
      // Check spell limits
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
      
      // Add spell to context
      addSpell(spell);
      
      // Also add spell directly to character
      const updatedSpells = [...(character.spells || [])];
      updatedSpells.push({
        id: spell.id,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        // Fix: convert description and classes using safe functions
        description: safelyConvertSpellDescription(spell.description),
        classes: safelyConvertSpellClasses(spell.classes),
        prepared: true // By default spells are prepared
      });
      
      updateCharacter({ spells: updatedSpells });
      
      // Update counters
      if (spell.level === 0) {
        setCantripsKnown(prev => prev + 1);
      } else {
        setSpellsKnown(prev => prev + 1);
      }
    } else {
      // Remove spell from context
      removeSpell(spell.id.toString());
      
      // Also remove spell from character
      if (character.spells) {
        const updatedSpells = character.spells.filter(s => {
          if (typeof s === 'string') return s !== spell.name;
          return s.id !== spell.id && s.name !== spell.name;
        });
        
        updateCharacter({ spells: updatedSpells });
        
        // Update counters
        if (spell.level === 0) {
          setCantripsKnown(prev => Math.max(0, prev - 1));
        } else {
          setSpellsKnown(prev => Math.max(0, prev - 1));
        }
      }
    }
  };

  // Save spells and go to next step
  const handleSaveAndContinue = () => {
    saveCharacterSpells();
    if (nextStep) nextStep();
  };

  // Get unique spell levels for tabs
  const spellLevels = useMemo(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) return [];
    return [...new Set(spellsToFilter.map(spell => spell.level))].sort((a, b) => a - b);
  }, [spellsToFilter]);

  // Group spells by level for tab labels
  const spellCountsByLevel = useMemo(() => {
    if (!spellsToFilter || spellsToFilter.length === 0) return {};
    
    return spellsToFilter.reduce((acc: Record<number, number>, spell) => {
      const level = spell.level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
  }, [spellsToFilter]);

  // Get page background
  useEffect(() => {
    setThemeStyles(currentTheme);
  }, [currentTheme]);

  // Page background
  const pageBackground = useMemo(() => `linear-gradient(to bottom, ${themeStyles.accent || '#333333'}20, ${themeStyles.cardBackground || 'rgba(0, 0, 0, 0.85)'})`, [themeStyles]);

  // If failed to load spells after several attempts
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
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold" style={{color: currentTheme.textColor}}>Выберите заклинания</h4>
        <p className="text-sm text-muted-foreground" style={{color: currentTheme.mutedTextColor}}>
          Уровень: {effectiveLevel}, Класс: {effectiveClass}
          <br />
          <span className={cantripsKnown >= cantripsCount ? "text-red-500 font-bold" : ""}>
            Известно заговоров: {cantripsKnown}/{cantripsCount}
          </span>, 
          <span className={spellsKnown >= knownSpells ? "text-red-500 font-bold" : ""}> 
            Известно заклинаний: {spellsKnown}/{knownSpells}
          </span>, 
          Макс. уровень заклинаний: {maxSpellLevel}
        </p>
        
        <Separator />
        
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Все ({spellsToFilter.length})
            </TabsTrigger>
            <TabsTrigger value="cantrips">
              Заговоры ({spellCountsByLevel[0] || 0})
            </TabsTrigger>
            {spellLevels.filter(level => level > 0).map(level => (
              <TabsTrigger key={`level-${level}`} value={String(level)}>
                {level} уровень ({spellCountsByLevel[level] || 0})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Загрузка заклинаний...
            </div>
          ) : filteredSpells.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {spellsToFilter.length === 0 
                ? `Нет доступных заклинаний для класса ${effectiveClass}` 
                : "Заклинания не найдены по запросу"}
            </div>
          ) : (
            filteredSpells.map((spell) => {
              const isAdded = isSpellKnown(spell);
              const canAdd = (spell.level === 0) 
                ? (cantripsKnown < cantripsCount) 
                : (spellsKnown < knownSpells);
              
              return (
                <Card key={spell.id || spell.name} style={{backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent}}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div style={{color: currentTheme.textColor}}>
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-xs">
                        {spell.school || "Универсальная"}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                      </div>
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
            allowNext={!loading}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </div>
      )}
    </div>
  );
};

export default CharacterSpellSelection;
