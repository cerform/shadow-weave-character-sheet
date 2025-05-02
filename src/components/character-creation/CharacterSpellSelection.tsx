import React, { useContext, useState, useMemo } from 'react';
import { useCreationStep } from '@/hooks/useCreationStep';
import { getSpellsByClass, getSpellDetails } from '@/data/spells'; 
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, X } from "lucide-react";
import { CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';

interface CharacterSpellSelectionProps {
  character: {
    class: string;
    spells: string[];
  };
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Функция для проверки заклинания на соответствие фильтрам
const matchesFilters = (
  spell: CharacterSpell | string,
  searchQuery: string,
  levelFilter: number | null
): boolean => {
  // Пустой поиск - все заклинания проходят
  if (!searchQuery && levelFilter === null) return true;

  // Если spell это строка
  if (typeof spell === 'string') {
    // Проверяем только поисковой запрос
    if (searchQuery && !spell.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Не можем проверить уровень для строки, предполагаем, что подходит
    return true;
  }

  // Если spell это объект CharacterSpell
  if (typeof spell === 'object' && spell !== null) {
    // Проверяем поисковой запрос
    if (searchQuery && 'name' in spell && typeof spell.name === 'string') {
      if (!spell.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    // Проверяем фильтр по уровню
    if (levelFilter !== null && 'level' in spell && typeof spell.level === 'number') {
      if (spell.level !== levelFilter) {
        return false;
      }
    }
    return true;
  }

  // Если тип не распознан, не показываем
  return false;
};

// Получаем доступные уровни заклинаний для класса и уровня
const getAvailableSpellLevels = (characterClass: string, level: number = 1): number[] => {
  // Всем заклинателям на первом уровне доступны заговоры (0) и заклинания 1 уровня
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(characterClass)) {
    if (level >= 3) return [0, 1, 2]; // С 3 уровня - доступ к заклинаниям 2 уровня
    return [0, 1]; // Заговоры и 1 уровень для начинающих
  }
  
  // Полузаклинатели (следопыты, паладины) получают заклинания со второго уровня
  if (['Следопыт', 'Паладин'].includes(characterClass)) {
    if (level >= 5) return [1, 2]; // С 5 уровня - доступ к заклинаниям 2 уровня
    if (level >= 2) return [1]; // С 2 уровня - доступ к заклинаниям 1 уровня
    return []; // На первом уровне нет заклинаний
  }
  
  // Воин (Мистический рыцарь) и Плут (Мистический ловкач) получают заклинания с 3 уровня
  if (characterClass === 'Воин' || characterClass === 'Плут') {
    if (level >= 3) return [0, 1]; // С 3 уровня - заговоры и 1 уровень
    return [];
  }
  
  // Для классов Варвар и Монах, которые обычно не имеют заклинаний по умолчанию, 
  // но могут получить их через особенности подклассов или фиты
  if (['Варвар', 'Монах'].includes(characterClass)) {
    if (level >= 3) return [0]; // С 3 уровня некоторые подклассы могут получать заговоры
    return [];
  }
  
  return []; // По умолчанию возвращаем пустой массив, если класс не имеет заклинаний
};

// Проверяет, имеет ли класс заклинания
const hasSpells = (characterClass: string, level: number = 1): boolean => {
  const availableLevels = getAvailableSpellLevels(characterClass, level);
  return availableLevels.length > 0;
};

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character, 
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  
  // Получаем список заклинаний для класса персонажа
  const classSpells = useMemo(() => {
    return getSpellsByClass(character.class);
  }, [character.class]);
  
  // Фильтруем заклинания по поиску и уровню
  const filteredSpells = useMemo(() => {
    let filtered = [...classSpells];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((spell) => {
        // Исправляем проблему с типом never
        if (typeof spell === 'object' && spell !== null) {
          if ('name' in spell && typeof spell.name === 'string') {
            return spell.name.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        } else if (typeof spell === 'string') {
          return spell.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    }
    
    // Фильтр по уровню
    if (levelFilter !== null) {
      filtered = filtered.filter((spell) => {
        if (typeof spell === 'object' && spell !== null && 'level' in spell && typeof spell.level === 'number') {
          return spell.level === levelFilter;
        }
        return false;
      });
    }
    
    return filtered;
  }, [classSpells, searchQuery, levelFilter]);
  
  // Получаем доступные уровни заклинаний для текущего класса
  const availableSpellLevels = useMemo(() => {
    return getAvailableSpellLevels(character.class);
  }, [character.class]);
  
  // Проверка, имеет ли текущий класс заклинания
  const classHasSpells = useMemo(() => {
    return hasSpells(character.class);
  }, [character.class]);
  
  // Обработчик добавления заклинания
  const handleAddSpell = (spellName: string) => {
    if (!character.spells.includes(spellName)) {
      updateCharacter({
        spells: [...character.spells, spellName]
      });
    }
    setSelectedSpell(null);
  };
  
  // Обработчик удаления заклинания
  const handleRemoveSpell = (spellName: string) => {
    const updatedSpells = character.spells.filter(s => s !== spellName);
    updateCharacter({ spells: updatedSpells });
  };

  // Если класс не имеет заклинаний, показываем сообщение и кнопку "Далее"
  if (!classHasSpells) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Заклинания</h2>
        <p className="text-muted-foreground">Ваш класс ({character.class}) не использует заклинания на данном уровне.</p>
        
        <NavigationButtons 
          allowNext={true}
          nextStep={nextStep} 
          prevStep={prevStep}
          nextLabel="Далее"
          prevLabel="Назад"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Выбор заклинаний</h2>
      <p className="text-muted-foreground">Выберите заклинания для вашего персонажа.</p>
      
      {/* Фильтры и поиск */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select
            value={levelFilter?.toString() || "all"}
            onValueChange={(value) => setLevelFilter(value === "all" ? null : Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Уровень" />
            </SelectTrigger>
            <SelectContent>
              {/* Fix: Using "all" as value instead of empty string */}
              <SelectItem value="all">Все уровни</SelectItem>
              {availableSpellLevels.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  {level === 0 ? "Заговор" : `Уровень ${level}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Список доступных заклинаний */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-2">
        {filteredSpells.length > 0 ? (
          filteredSpells.map((spell, index) => {
            // Определяем имя и уровень заклинания в зависимости от типа
            const spellName = typeof spell === 'object' && spell !== null && 'name' in spell 
              ? spell.name 
              : typeof spell === 'string' ? spell : '';
            
            const spellLevel = typeof spell === 'object' && spell !== null && 'level' in spell 
              ? spell.level 
              : 0;
            
            // Если пустое имя, пропускаем
            if (!spellName) return null;
            
            return (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={() => setSelectedSpell(spellName)}
              >
                <div>
                  <div>{spellName}</div>
                  <div className="text-xs text-muted-foreground">
                    {spellLevel === 0 ? "Заговор" : `Уровень ${spellLevel}`}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSpell(spellName);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-4 text-center text-muted-foreground">
            Нет подходящих заклинаний
          </div>
        )}
      </div>
      
      {/* Выбранные заклинания */}
      <div>
        <h3 className="text-lg font-medium mb-2">Выбранные заклинания</h3>
        {character.spells.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {character.spells.map((spell, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <div>{spell}</div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleRemoveSpell(spell)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            У вас пока нет выбранных заклинаний
          </p>
        )}
      </div>
      
      {/* Кнопки навигации */}
      <NavigationButtons 
        allowNext={true}
        nextStep={nextStep} 
        prevStep={prevStep}
        nextLabel="Далее"
        prevLabel="Назад"
      />
    </div>
  );
};

export default CharacterSpellSelection;
