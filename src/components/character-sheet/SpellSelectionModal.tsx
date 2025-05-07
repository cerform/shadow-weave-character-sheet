import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Check } from 'lucide-react';
import { Character, CharacterSpell } from '@/types/character';
import { fetchSpells } from '@/services/spellService';
import { useToast } from '@/hooks/use-toast';
import { getPreparedSpellsLimit, canPrepareMoreSpells, filterSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import { spells as allSpells } from '@/data/spells';
import { SpellData } from '@/types/spells';
import { normalizeCharacterSpells, updateCharacterSpells } from '@/utils/spellTypeUtils';

interface SpellSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Список школ магии
const SPELL_SCHOOLS = [
  'Ограждение', 'Очарование', 'Воплощение', 'Прорицание',
  'Вызов', 'Некромантия', 'Преобразование', 'Иллюзия'
];

// Список классов
const CHARACTER_CLASSES = [
  'Бард', 'Жрец', 'Друид', 'Паладин', 'Следопыт',
  'Чародей', 'Колдун', 'Волшебник'
];

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onOpenChange,
  character,
  onUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Получаем максимально возможное количество подготовленных заклинаний
  const preparedSpellsLimit = getPreparedSpellsLimit(character);
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedSpellsCount = character.spells?.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length || 0;

  // Получаем максимальный уровень заклинаний доступный персонажу
  const maxSpellLevel = useMemo(() => {
    return getMaxSpellLevel(character.class || '', character.level || 1);
  }, [character.class, character.level]);

  // Загружаем заклинания
  useEffect(() => {
    if (open) {
      try {
        // Получаем все заклинания
        const availableSpells = allSpells.map(spell => ({
          id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: spell.name,
          level: spell.level,
          school: spell.school || 'Универсальная',
          castingTime: spell.castingTime || '1 действие',
          range: spell.range || 'На себя',
          components: spell.components || '',
          duration: spell.duration || 'Мгновенная',
          description: spell.description || 'Нет описания',
          classes: spell.classes || [],
          ritual: spell.ritual || false,
          concentration: spell.concentration || false
        }));
        
        // Фильтруем заклинания по классу и уровню, если указан класс персонажа
        const characterClass = character.class;
        
        if (characterClass) {
          const filteredByClass = availableSpells.filter(spell => {
            const isClassSpell = typeof spell.classes === 'string'
              ? spell.classes.toLowerCase() === characterClass.toLowerCase() || 
                (characterClass.toLowerCase() === 'жрец' && spell.classes.toLowerCase() === 'cleric') ||
                (characterClass.toLowerCase() === 'волшебник' && spell.classes.toLowerCase() === 'wizard')
              : Array.isArray(spell.classes) && spell.classes.some(cls => 
                  cls.toLowerCase() === characterClass.toLowerCase() ||
                  (characterClass.toLowerCase() === 'жрец' && cls.toLowerCase() === 'cleric') ||
                  (characterClass.toLowerCase() === 'волшебник' && cls.toLowerCase() === 'wizard')
                );
            
            const isLevelValid = spell.level <= maxSpellLevel;
            
            return isClassSpell && isLevelValid;
          });
          
          setSpells(filteredByClass);
          setFilteredSpells(filteredByClass);
        } else {
          setSpells(availableSpells);
          setFilteredSpells(availableSpells);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заклинаний:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список заклинаний",
          variant: "destructive"
        });
      }
    }
  }, [open, character.class, maxSpellLevel, toast]);

  // Фильтруем заклинания при изменении параметров поиска
  useEffect(() => {
    let result = [...spells];
    
    // Фильтр по поисковому запросу
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(searchTermLower) ||
        (spell.school && spell.school.toLowerCase().includes(searchTermLower)) ||
        (typeof spell.description === 'string' && spell.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Фильтр по уровню
    if (selectedLevel !== null) {
      result = result.filter(spell => spell.level === selectedLevel);
    }
    
    // Фильтр по школе
    if (selectedSchool) {
      result = result.filter(spell => 
        spell.school && spell.school.toLowerCase() === selectedSchool.toLowerCase()
      );
    }
    
    // Фильтр по классу
    if (selectedClass) {
      const selectedClassLower = selectedClass.toLowerCase();
      result = result.filter(spell => {
        if (!spell.classes) return false;
        
        if (typeof spell.classes === 'string') {
          return spell.classes.toLowerCase().includes(selectedClassLower);
        }
        
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => 
            typeof cls === 'string' && cls.toLowerCase().includes(selectedClassLower)
          );
        }
        
        return false;
      });
    }
    
    setFilteredSpells(result);
  }, [spells, searchTerm, selectedLevel, selectedSchool, selectedClass]);

  // Проверяем, добавлено ли заклинание в список заклинаний персонажа
  const isSpellAdded = (spellName: string): boolean => {
    if (!character.spells) return false;
    
    const normalizedSpells = normalizeCharacterSpells(character.spells);
    return normalizedSpells.some(spell => spell.name === spellName);
  };

  // Добавляем заклинание персонажу
  const addSpellToCharacter = (spell: CharacterSpell) => {
    if (isSpellAdded(spell.name)) {
      toast({
        title: "Заклинание уже добавлено",
        description: `Заклинание ${spell.name} уже в списке известных заклинаний`
      });
      return;
    }
    
    // Копируем массив заклинаний персонажа или создаем новый
    const normalizedSpells = normalizeCharacterSpells(character.spells || []);
    
    // Добавляем заклинание
    const updatedSpells = [...normalizedSpells, spell];
    
    onUpdate(updateCharacterSpells(character, updatedSpells));
    
    toast({
      title: "Заклинание добавлено",
      description: `Заклинание ${spell.name} добавлено в список известных заклинаний`
    });
  };

  // Удаляем заклинание из списка персонажа
  const removeSpellFromCharacter = (spellName: string) => {
    if (!character.spells) return;
    
    const normalizedSpells = normalizeCharacterSpells(character.spells);
    const updatedSpells = normalizedSpells.filter(spell => spell.name !== spellName);
    
    onUpdate(updateCharacterSpells(character, updatedSpells));
    
    toast({
      title: "Заклинание удалено",
      description: `Заклинание ${spellName} удалено из списка известных заклинаний`
    });
  };

  // Переключение статуса подготовки заклинания
  const toggleSpellPrepared = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    // Проверяем, можно ли подготовить еще заклинания
    if (!spell.prepared && spell.level > 0 && !canPrepareMoreSpells(character)) {
      toast({
        title: "Лимит подготовленных заклинаний",
        description: `Вы не можете подготовить больше заклинаний. Максимум: ${preparedSpellsLimit}`,
        variant: "destructive"
      });
      return;
    }
    
    const normalizedSpells = normalizeCharacterSpells(character.spells);
    const updatedSpells = normalizedSpells.map(existingSpell => {
      if (existingSpell.name === spell.name) {
        return {
          ...existingSpell,
          prepared: !existingSpell.prepared
        };
      }
      return existingSpell;
    });
    
    onUpdate(updateCharacterSpells(character, updatedSpells));
    
    toast({
      title: spell.prepared ? "Заклинание не подготовлено" : "Заклинание подготовлено",
      description: `Заклинание ${spell.name} ${spell.prepared ? 'убрано из' : 'добавлено в'} список подготовленных`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center mb-4">
          <Search className="w-4 h-4 mr-2" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all" onClick={() => setSelectedLevel(null)}>
              Все
            </TabsTrigger>
            <TabsTrigger value="cantrips" onClick={() => setSelectedLevel(0)}>
              Заговоры
            </TabsTrigger>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              <TabsTrigger 
                key={`level-${level}`} 
                value={`level-${level}`}
                onClick={() => setSelectedLevel(level)}
                disabled={level > maxSpellLevel}
              >
                {level}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex flex-wrap mb-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={selectedSchool === null ? 'bg-primary/20' : ''}
              onClick={() => setSelectedSchool(null)}
            >
              Все школы
            </Button>
            {SPELL_SCHOOLS.map(school => (
              <Button
                key={school}
                variant="outline"
                size="sm"
                className={selectedSchool === school ? 'bg-primary/20' : ''}
                onClick={() => setSelectedSchool(school === selectedSchool ? null : school)}
              >
                {school}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-wrap mb-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={selectedClass === null ? 'bg-primary/20' : ''}
              onClick={() => setSelectedClass(null)}
            >
              Все классы
            </Button>
            {CHARACTER_CLASSES.map(cls => (
              <Button
                key={cls}
                variant="outline"
                size="sm"
                className={selectedClass === cls ? 'bg-primary/20' : ''}
                onClick={() => setSelectedClass(cls === selectedClass ? null : cls)}
              >
                {cls}
              </Button>
            ))}
          </div>
          
          {preparedSpellsLimit > 0 && (
            <div className="flex justify-between items-center mb-4 text-sm">
              <span>Класс: {character.class}</span>
              <Badge variant={preparedSpellsCount >= preparedSpellsLimit ? "destructive" : "outline"}>
                Подготовлено: {preparedSpellsCount}/{preparedSpellsLimit}
              </Badge>
            </div>
          )}
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-3">
              {filteredSpells.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {spells.length === 0 
                    ? "Загрузка заклинаний..." 
                    : "Заклинания не найдены"}
                </div>
              ) : (
                filteredSpells.map(spell => {
                  const isAdded = isSpellAdded(spell.name);
                  
                  // Находим заклинание в списке персонажа, чтобы проверить его статус
                  let characterSpell: CharacterSpell | null = null;
                  if (isAdded && character.spells) {
                    const foundSpell = character.spells.find(s => {
                      if (typeof s === 'string') return s === spell.name;
                      return s.name === spell.name;
                    });
                    
                    if (foundSpell && typeof foundSpell !== 'string') {
                      characterSpell = foundSpell;
                    }
                  }
                  
                  return (
                    <div 
                      key={spell.id || spell.name} 
                      className="p-3 border rounded-md hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{spell.name}</h3>
                            <Badge variant="outline" className="ml-2">
                              {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
                            </Badge>
                            {spell.school && (
                              <Badge variant="secondary" className="ml-1">
                                {spell.school}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {spell.castingTime && <span className="mr-3">Время накладывания: {spell.castingTime}</span>}
                            {spell.range && <span className="mr-3">Дистанция: {spell.range}</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {spell.components && <span className="mr-3">Компоненты: {spell.components}</span>}
                            {spell.duration && <span>Длительность: {spell.duration}</span>}
                          </div>
                          {spell.classes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Классы: {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
                            </div>
                          )}
                        </div>
                        <div className="space-x-2">
                          {isAdded ? (
                            <>
                              {spell.level > 0 && characterSpell && 
                              (character.class === "Жрец" || 
                               character.class === "Друид" || 
                               character.class === "Волшебник" || 
                               character.class === "Паладин" || 
                               character.class === "Следопыт") && (
                                <Button 
                                  variant={characterSpell.prepared ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleSpellPrepared(characterSpell!)}
                                  disabled={!characterSpell.prepared && preparedSpellsCount >= preparedSpellsLimit}
                                >
                                  {characterSpell.prepared ? (
                                    <Check className="w-4 h-4 mr-1" />
                                  ) : null}
                                  {characterSpell.prepared ? "Подготовлено" : "Подготовить"}
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeSpellFromCharacter(spell.name)}
                              >
                                Удалить
                              </Button>
                            </>
                          ) : (
                            <Button 
                              onClick={() => addSpellToCharacter(spell)}
                            >
                              Добавить
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
