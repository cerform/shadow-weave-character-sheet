
import React, { useState, useEffect } from "react";
import { getSpellsForClass, getSpellDetails } from "@/data/spells";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CharacterSpellSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Перемещаем функцию getRacialSpells выше для предотвращения ошибки
const getRacialSpells = (race: string, subrace?: string): string[] => {
  // Расовые заклинания для разных рас
  const racialSpells: Record<string, string[]> = {
    "Эльф": ["Танцующие огоньки"],
    "Тифлинг": ["Чудотворство", "Адское возмездие"],
    "Гном": ["Малая иллюзия"],
    // Подрасы
    "Высший эльф": ["Волшебная рука", "Фокусы"],
    "Лесной эльф": ["Маскировка"],
    "Тёмный эльф": ["Пляшущий свет", "Волшебная рука"]
  };
  
  let spells: string[] = [];
  if (race && racialSpells[race]) {
    spells = [...spells, ...racialSpells[race]];
  }
  if (subrace && racialSpells[subrace]) {
    spells = [...spells, ...racialSpells[subrace]];
  }
  
  return spells;
};

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSpells, setSelectedSpells] = useState<string[]>(character.spells || []);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  
  // Получаем доступные заклинания, учитывая класс, расу и уровень персонажа
  const availableSpells = useMemo(() => {
    if (!character.class) return [];
    
    // Берем заклинания для выбранного класса
    let spellList = getSpellsForClass(character.class);
    
    // Добавляем расовые заклинания, если есть
    if (character.race) {
      const raceSpells = getRacialSpells(character.race, character.subrace);
      if (raceSpells.length > 0) {
        spellList = [...spellList, ...raceSpells];
      }
    }
    
    // Фильтруем по уровню персонажа и уровню заклинания
    return spellList.filter(spell => {
      const details = getSpellDetails(spell);
      // Ограничиваем доступ к заклинаниям высокого уровня
      if (!details) return false;
      
      // Для заклинателей полного круга (Волшебник, Чародей, Жрец и т.д.)
      if (["Волшебник", "Чародей", "Жрец", "Друид", "Бард"].includes(character.class)) {
        // Максимальный уровень заклинаний
        const maxSpellLevel = Math.min(Math.ceil(character.level / 2), 9);
        return details.level <= maxSpellLevel;
      } 
      // Для половинных заклинателей (Паладин, Следопыт)
      else if (["Паладин", "Следопыт"].includes(character.class)) {
        // Начинают с 2 уровня и получают заклинания медленнее
        if (character.level < 2) return details.level === 0; // Только заговоры на 1 уровне
        const maxSpellLevel = Math.min(Math.ceil((character.level - 1) / 4) + 1, 5);
        return details.level <= maxSpellLevel;
      }
      // Для чернокнижников с особым прогрессом заклинаний
      else if (character.class === "Чернокнижник") {
        const maxSpellLevel = Math.min(Math.ceil(character.level / 2), 5);
        return details.level <= maxSpellLevel;
      }
      
      return true;
    });
  }, [character.class, character.race, character.subrace, character.level]);

  // ... оставляем остальной код без изменений
  
  // Фильтруем по поисковому запросу и уровню заклинания
  const filteredSpells = useMemo(() => {
    let filtered = availableSpells;
    
    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter((spell) => 
        spell.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Фильтр по уровню
    if (levelFilter !== null) {
      filtered = filtered.filter((spell) => {
        const details = getSpellDetails(spell);
        return details && details.level === levelFilter;
      });
    }
    
    return filtered;
  }, [searchQuery, levelFilter, availableSpells]);

  const toggleSpell = (spell: string) => {
    if (selectedSpells.includes(spell)) {
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    } else {
      // Проверяем лимит заклинаний
      const maxSpells = getMaxSpells();
      if (selectedSpells.length < maxSpells) {
        setSelectedSpells([...selectedSpells, spell]);
      }
    }
  };

  const getMaxSpells = () => {
    const level = character.level || 1;

    // Количество заклинаний по классу
    if (character.class === "Волшебник") {
      // 6 + уровень + мод интеллекта
      const intMod = Math.floor((character.stats?.intelligence - 10) / 2) || 0;
      return 6 + level + intMod;
    }
    if (character.class === "Чародей" || character.class === "Бард") {
      // Известные заклинания - уровень + 1 для чародея
      return level + 1 + 4;
    }
    if (character.class === "Чернокнижник") {
      // Меньше заклинаний, но они всегда максимального уровня
      return Math.min(2 + Math.floor((level - 1) / 2), 15);
    }
    if (character.class === "Жрец" || character.class === "Друид") {
      // Уровень + мод мудрости
      const wisMod = Math.floor((character.stats?.wisdom - 10) / 2) || 0;
      return level + wisMod + 2;
    }
    if (character.class === "Паладин" || character.class === "Следопыт") {
      // Половина уровня + мод базовой характеристики
      const mainStatMod = Math.floor((character.stats?.wisdom - 10) / 2) || 0;
      return Math.floor(level / 2) + mainStatMod + 1;
    }
    return 0; // Не-заклинательные классы
  };

  const getSpellsRemaining = () => {
    const maxSpells = getMaxSpells();
    return maxSpells - selectedSpells.length;
  };

  const canContinue = () => {
    // Мы разрешаем продолжить даже без заклинаний для магических классов,
    // но показываем предупреждение
    return true;
  };

  const handleNext = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  const getSchoolColor = (school: string): string => {
    const schoolColors: {[key: string]: string} = {
      "Воплощение": "bg-red-500/20 text-red-700 dark:text-red-300",
      "Ограждение": "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      "Иллюзия": "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      "Некромантия": "bg-green-500/20 text-green-700 dark:text-green-300",
      "Призывание": "bg-amber-500/20 text-amber-700 dark:text-amber-300",
      "Прорицание": "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
      "Очарование": "bg-pink-500/20 text-pink-700 dark:text-pink-300",
      "Трансмутация": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      "Зачарование": "bg-violet-500/20 text-violet-700 dark:text-violet-300"
    };
    
    return schoolColors[school] || "bg-primary/20";
  };

  // Группировка заклинаний по уровню
  const spellsByLevel = useMemo(() => {
    const spellsByLvl: { [key: number]: string[] } = {};
    filteredSpells.forEach(spell => {
      const details = getSpellDetails(spell);
      if (details) {
        if (!spellsByLvl[details.level]) spellsByLvl[details.level] = [];
        spellsByLvl[details.level].push(spell);
      }
    });
    return spellsByLvl;
  }, [filteredSpells]);

  // Пропускаем шаг для не-магических классов
  const isMagicClass = ["Волшебник", "Чародей", "Жрец", "Друид", "Бард", "Паладин", "Следопыт", "Чернокнижник"].includes(character.class || "");
  if (!isMagicClass) {
    // Перенаправляем на следующий шаг
    React.useEffect(() => {
      nextStep();
    }, []);
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите заклинания</h2>
      
      <div className="mb-4 space-y-2">
        <p className="text-muted-foreground">
          Для класса <span className="font-medium text-primary">{character.class}</span> уровня <span className="font-medium text-primary">{character.level}</span> вы можете выбрать до <span className="font-medium text-primary">{getMaxSpells()}</span> заклинаний.
        </p>
        <p className="text-muted-foreground">
          Осталось выбрать: <span className="font-medium text-green-500">{getSpellsRemaining()}</span>
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant={levelFilter === null ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setLevelFilter(null)}
          >
            Все уровни
          </Badge>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
            <Badge 
              key={level}
              variant={levelFilter === level ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setLevelFilter(level)}
            >
              {level === 0 ? "Заговоры" : `${level} уровень`}
            </Badge>
          ))}
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Доступные заклинания ({filteredSpells.length})</h3>
          <ScrollArea className="h-72 border rounded-md p-2">
            {Object.entries(spellsByLevel)
              .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
              .map(([level, spells]) => (
                <div key={level} className="mb-4">
                  <h4 className="text-sm font-medium mb-1">
                    {Number(level) === 0 ? "Заговоры" : `${level} уровень`}
                  </h4>
                  <div className="space-y-1">
                    {spells.map(spell => {
                      const details = getSpellDetails(spell);
                      const isSelected = selectedSpells.includes(spell);
                      
                      return (
                        <HoverCard key={spell}>
                          <HoverCardTrigger asChild>
                            <button
                              onClick={() => toggleSpell(spell)}
                              disabled={!isSelected && getSpellsRemaining() <= 0}
                              className={`w-full p-2 text-left text-sm rounded transition-colors ${
                                isSelected 
                                  ? "bg-green-500 text-white" 
                                  : getSpellsRemaining() <= 0 
                                    ? "bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed" 
                                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{spell}</span>
                                <Badge variant="outline" className={details?.school ? getSchoolColor(details.school) : ''}>
                                  {details?.level === 0 ? "Зг" : `${details?.level}`}
                                </Badge>
                              </div>
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-96">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <h4 className="font-semibold">{spell}</h4>
                                <Badge className={details?.school ? getSchoolColor(details.school) : ''}>
                                  {details?.level === 0 ? "Заговор" : `${details?.level} круг`}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{details?.school}</p>
                              
                              <div className="py-2 text-xs space-y-1">
                                <div><span className="font-medium">Время накладывания:</span> {details?.castingTime}</div>
                                <div><span className="font-medium">Дистанция:</span> {details?.range}</div>
                                <div><span className="font-medium">Компоненты:</span> {details?.components}</div>
                                <div><span className="font-medium">Длительность:</span> {details?.duration}</div>
                              </div>
                              
                              <p className="text-sm">{details?.description}</p>
                              
                              {details?.higherLevels && (
                                <div className="text-sm pt-2">
                                  <span className="font-medium">На более высоких уровнях: </span>
                                  {details.higherLevels}
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground pt-2 border-t">
                                Классы: {details?.classes?.join(", ")}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filteredSpells.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  Нет заклинаний, соответствующих запросу
                </div>
              )}
          </ScrollArea>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Выбранные заклинания ({selectedSpells.length})</h3>
          <ScrollArea className="h-72 border rounded-md p-2">
            <div className="space-y-1">
              {selectedSpells.length > 0 ? (
                selectedSpells.map((spell) => {
                  const details = getSpellDetails(spell);
                  
                  return (
                    <button
                      key={spell}
                      onClick={() => toggleSpell(spell)}
                      className="w-full p-2 text-left text-sm rounded bg-green-500 text-white hover:bg-green-600"
                    >
                      <div className="flex justify-between items-center">
                        <span>{spell}</span>
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                          {details?.level === 0 ? "Заговор" : `${details?.level} круг`}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  Вы еще не выбрали ни одного заклинания
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Предупреждение при отсутствии заклинаний */}
      {selectedSpells.length === 0 && isMagicClass && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Внимание!</AlertTitle>
          <AlertDescription>
            Вы не выбрали ни одного заклинания для вашего заклинателя. Вы уверены, что хотите продолжить?
          </AlertDescription>
        </Alert>
      )}

      {/* Навигационные кнопки */}
      <NavigationButtons
        allowNext={canContinue()}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSpellSelection;
