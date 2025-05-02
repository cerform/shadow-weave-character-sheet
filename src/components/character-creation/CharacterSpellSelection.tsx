
import React, { useState, useMemo } from 'react';
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
import { Search, Plus, X, Check } from "lucide-react";
import { CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface CharacterSpellSelectionProps {
  character: {
    class: string;
    spells: string[];
    level?: number; // Добавляем level как опциональное поле
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
  // Воины-Мистические Рыцари и Плуты-Мистические Ловкачи получают заклинания с 3 уровня
  if (characterClass === 'Воин' || characterClass === 'Плут') {
    if (level < 3) return []; // Нет заклинаний до 3 уровня
    if (level >= 3 && level < 7) return [0, 1]; // С 3 уровня - заговоры и 1 уровень
    if (level >= 7 && level < 13) return [0, 1, 2]; // С 7 уровня - заклинания 2 уровня
    if (level >= 13 && level < 19) return [0, 1, 2, 3]; // С 13 уровня - заклинания 3 уровня
    if (level >= 19) return [0, 1, 2, 3, 4]; // С 19 уровня - заклинания 4 уровня
    return [];
  }
  
  // Всем заклинателям на первом уровне доступны заговоры (0) и заклинания 1 уровня
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(characterClass)) {
    if (level < 3) return [0, 1]; // Начальные уровни
    if (level >= 3 && level < 5) return [0, 1, 2]; // С 3 уровня - доступ к заклинаниям 2 уровня
    if (level >= 5 && level < 7) return [0, 1, 2, 3]; // С 5 уровня - доступ к заклинаниям 3 уровня
    if (level >= 7 && level < 9) return [0, 1, 2, 3, 4]; // И так далее...
    if (level >= 9 && level < 11) return [0, 1, 2, 3, 4, 5];
    if (level >= 11 && level < 13) return [0, 1, 2, 3, 4, 5, 6];
    if (level >= 13 && level < 15) return [0, 1, 2, 3, 4, 5, 6, 7];
    if (level >= 15 && level < 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8];
    if (level >= 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return [0, 1]; // Заговоры и 1 уровень для начинающих
  }
  
  // Полузаклинатели (следопыты, паладины) получают заклинания со второго уровня
  if (['Следопыт', 'Паладин'].includes(characterClass)) {
    if (level < 2) return []; // Нет заклинаний на 1 уровне
    if (level >= 2 && level < 5) return [1]; // С 2 уровня - доступ к заклинаниям 1 уровня
    if (level >= 5 && level < 9) return [1, 2]; // С 5 уровня - доступ к заклинаниям 2 уровня
    if (level >= 9 && level < 13) return [1, 2, 3]; // С 9 уровня - доступ к заклинаниям 3 уровня
    if (level >= 13 && level < 17) return [1, 2, 3, 4]; // С 13 уровня - доступ к заклинаниям 4 уровня
    if (level >= 17) return [1, 2, 3, 4, 5]; // С 17 уровня - доступ к заклинаниям 5 уровня
    return []; // На первом уровне нет заклинаний
  }
  
  // Варвары (Путь Тотемного Воина) могут получить ритуальные заклинания с 3 уровня
  if (characterClass === 'Варвар') {
    if (level >= 3) return [1]; // С 3 уровня - доступ к некоторым ритуальным заклинаниям
    return [];
  }
  
  // Монахи (Путь Четырех Стихий) получают некоторые заклинания с 3 уровня
  if (characterClass === 'Монах') {
    if (level < 3) return []; // Нет заклинаний до 3 уровня
    if (level >= 3 && level < 5) return [1]; // С 3 уровня - доступ к некоторым стихийным заклинаниям
    if (level >= 5 && level < 9) return [1, 2]; 
    if (level >= 9 && level < 13) return [1, 2, 3];
    if (level >= 13 && level < 17) return [1, 2, 3, 4];
    if (level >= 17) return [1, 2, 3, 4, 5];
    return [];
  }
  
  return []; // По умолчанию возвращаем пустой массив, если класс не имеет заклинаний
};

// Проверяет, имеет ли класс заклинания
const hasSpells = (characterClass: string, level: number = 1): boolean => {
  // Полные заклинатели всегда имеют заклинания
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(characterClass)) {
    return true;
  }
  
  // Полузаклинатели имеют заклинания со второго уровня
  if (['Следопыт', 'Паладин'].includes(characterClass)) {
    return level >= 2;
  }
  
  // Воин (Мистический рыцарь) и Плут (Мистический ловкач) могут получить заклинания с 3-го уровня
  if (characterClass === 'Воин' || characterClass === 'Плут') {
    return level >= 3;
  }
  
  // Варвар (Путь Тотемного Воина) может получить некоторые ритуальные заклинания с 3-го уровня
  if (characterClass === 'Варвар') {
    return level >= 3;
  }
  
  // Монах (Путь Четырех Стихий) может получить некоторые заклинания с 3-го уровня
  if (characterClass === 'Монах') {
    return level >= 3;
  }
  
  return false;
};

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character, 
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const characterLevel = character.level || 1;
  
  // Получаем список заклинаний для класса персонажа
  const classSpells = useMemo(() => {
    return getSpellsByClass(character.class, characterLevel);
  }, [character.class, characterLevel]);
  
  // Получаем доступные уровни заклинаний для текущего класса и уровня
  const availableSpellLevels = useMemo(() => {
    return getAvailableSpellLevels(character.class, characterLevel);
  }, [character.class, characterLevel]);
  
  // Проверка, имеет ли текущий класс заклинания на данном уровне
  const classHasSpells = useMemo(() => {
    return hasSpells(character.class, characterLevel);
  }, [character.class, characterLevel]);
  
  // Группировка заклинаний по уровням для табов
  const spellsByLevel = useMemo(() => {
    const grouped: {[key: string]: CharacterSpell[]} = {};
    
    // Инициализируем группы для всех доступных уровней
    availableSpellLevels.forEach(level => {
      grouped[level.toString()] = [];
    });
    
    // Группируем заклинания по уровням
    classSpells.forEach(spell => {
      const levelStr = spell.level.toString();
      if (!grouped[levelStr]) {
        grouped[levelStr] = [];
      }
      grouped[levelStr].push(spell);
    });
    
    return grouped;
  }, [classSpells, availableSpellLevels]);
  
  // Фильтруем заклинания по поиску в пределах активной вкладки
  const filteredSpells = useMemo(() => {
    if (!searchQuery && activeTab === "all") return classSpells;
    
    if (activeTab === "all") {
      // Фильтруем все заклинания по поисковому запросу
      return classSpells.filter(spell => 
        typeof spell.name === 'string' && spell.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Фильтруем заклинания конкретного уровня по поисковому запросу
      const levelSpells = spellsByLevel[activeTab] || [];
      if (!searchQuery) return levelSpells;
      
      return levelSpells.filter(spell => 
        typeof spell.name === 'string' && spell.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [classSpells, spellsByLevel, activeTab, searchQuery]);
  
  // Проверяет, выбрано ли заклинание
  const isSpellSelected = (spellName: string) => {
    return character.spells.includes(spellName);
  };
  
  // Обработчик добавления заклинания
  const handleAddSpell = (spellName: string) => {
    if (!character.spells.includes(spellName)) {
      updateCharacter({
        spells: [...character.spells, spellName]
      });
    }
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
        <p className="text-muted-foreground">
          Ваш класс ({character.class}) не использует заклинания на {characterLevel} уровне.
        </p>
        <p className="text-muted-foreground text-sm">
          {character.class === "Воин" && "На 3-м уровне воины, выбравшие архетип Мистического Рыцаря, получают доступ к заклинаниям."}
          {character.class === "Плут" && "На 3-м уровне плуты, выбравшие архетип Мистического Ловкача, получают доступ к заклинаниям."}
          {character.class === "Варвар" && "На 3-м уровне варвары, выбравшие Путь Тотемного Воина, получают доступ к некоторым ритуальным заклинаниям."}
          {character.class === "Монах" && "На 3-м уровне монахи, выбравшие Путь Четырех Стихий, получают доступ к некоторым заклинаниям стихий."}
          {['Следопыт', 'Паладин'].includes(character.class) && `На 2-м уровне ${character.class === 'Следопыт' ? 'следопыты' : 'паладины'} получают доступ к заклинаниям.`}
        </p>
        
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
      
      {/* Поиск заклинаний */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск заклинаний..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Табы с уровнями заклинаний */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-6 lg:grid-cols-11 mb-4">
          <TabsTrigger value="all" className="text-center">
            Все
          </TabsTrigger>
          
          {availableSpellLevels.map(level => (
            <TabsTrigger key={level} value={level.toString()} className="text-center">
              {level === 0 ? "Заговоры" : `${level} круг`}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Содержимое вкладки "Все заклинания" */}
        <TabsContent value="all" className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-2">
            {filteredSpells.length > 0 ? (
              filteredSpells.map((spell) => (
                <div 
                  key={spell.name} 
                  className={`flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer ${
                    isSpellSelected(spell.name) ? "bg-purple-100 dark:bg-purple-900/30" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className={isSpellSelected(spell.name) ? "text-purple-700 dark:text-purple-300 font-medium" : ""}>
                      {spell.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {spell.level === 0 ? "Заговор" : `${spell.level} круг`} • {spell.school}
                    </div>
                  </div>
                  {isSpellSelected(spell.name) ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveSpell(spell.name)}
                      className="text-purple-600 dark:text-purple-400"
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="text-sm">Убрать</span>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleAddSpell(spell.name)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="text-sm">Добавить</span>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 p-4 text-center text-muted-foreground">
                Нет подходящих заклинаний
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Содержимое вкладок для каждого уровня заклинаний */}
        {availableSpellLevels.map(level => (
          <TabsContent key={level} value={level.toString()} className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-2">
              {spellsByLevel[level.toString()]?.filter(spell => 
                !searchQuery || spell.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length > 0 ? (
                spellsByLevel[level.toString()]
                  ?.filter(spell => !searchQuery || spell.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((spell) => (
                    <div 
                      key={spell.name} 
                      className={`flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer ${
                        isSpellSelected(spell.name) ? "bg-purple-100 dark:bg-purple-900/30" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className={isSpellSelected(spell.name) ? "text-purple-700 dark:text-purple-300 font-medium" : ""}>
                          {spell.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {spell.school}
                        </div>
                      </div>
                      {isSpellSelected(spell.name) ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveSpell(spell.name)}
                          className="text-purple-600 dark:text-purple-400"
                        >
                          <X className="h-4 w-4 mr-1" />
                          <span className="text-sm">Убрать</span>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleAddSpell(spell.name)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span className="text-sm">Добавить</span>
                        </Button>
                      )}
                    </div>
                  ))
              ) : (
                <div className="col-span-2 p-4 text-center text-muted-foreground">
                  Нет подходящих заклинаний
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Выбранные заклинания */}
      <div>
        <h3 className="text-lg font-medium mb-2">Выбранные заклинания</h3>
        {character.spells.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {character.spells.map((spell, index) => {
              const spellDetails = getSpellDetails(spell);
              
              return (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-2 border rounded-md bg-purple-50 dark:bg-purple-900/20"
                >
                  <div>
                    <div>{spell}</div>
                    {spellDetails && (
                      <div className="text-xs text-muted-foreground">
                        {spellDetails.level === 0 ? "Заговор" : `${spellDetails.level} круг`} • {spellDetails.school}
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRemoveSpell(spell)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
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
