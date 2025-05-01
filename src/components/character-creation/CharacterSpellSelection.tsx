
import React, { useState, useEffect } from "react";
import { getSpellsForClass, getSpellDetails } from "@/data/spells";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CharacterSpellSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSpells, setSelectedSpells] = useState<string[]>(character.spells || []);
  const [availableSpells, setAvailableSpells] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSpells, setFilteredSpells] = useState<string[]>([]);

  useEffect(() => {
    if (character.class) {
      const spellList = getSpellsForClass(character.class);
      setAvailableSpells(spellList);
      setFilteredSpells(spellList);
    } else {
      setAvailableSpells([]);
      setFilteredSpells([]);
    }
  }, [character.class]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSpells(
        availableSpells.filter((spell) =>
          spell.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSpells(availableSpells);
    }
  }, [searchQuery, availableSpells]);

  const toggleSpell = (spell: string) => {
    if (selectedSpells.includes(spell)) {
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    } else {
      // Check if we're at the maximum spells limit
      const maxSpells = getMaxSpells();
      if (selectedSpells.length < maxSpells) {
        setSelectedSpells([...selectedSpells, spell]);
      }
    }
  };

  const getMaxSpells = () => {
    const level = character.level || 1;

    if (character.class === "Волшебник" || character.class === "Чародей") {
      return Math.min(6 + Math.floor(level / 2), 15);
    }
    if (character.class === "Чернокнижник") {
      return Math.min(2 + Math.floor(level / 2), 8);
    }
    if (character.class === "Жрец" || character.class === "Друид" || character.class === "Бард") {
      return Math.min(4 + Math.floor(level / 3), 12);
    }
    if (character.class === "Паладин" || character.class === "Следопыт") {
      return Math.min(2 + Math.floor(level / 3), 8);
    }
    return 0; // Non-magic classes
  };

  const getSpellsRemaining = () => {
    const maxSpells = getMaxSpells();
    return maxSpells - selectedSpells.length;
  };

  const canContinue = () => {
    // Magic classes must select at least 1 spell to continue
    if (character.class === "Волшебник" || character.class === "Чародей" || 
        character.class === "Жрец" || character.class === "Друид" || 
        character.class === "Бард" || character.class === "Паладин" || 
        character.class === "Следопыт" || character.class === "Чернокнижник") {
      return selectedSpells.length > 0;
    }
    return true; // Non-magical classes can skip
  };

  const handleNext = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  // Skip this step for non-magical classes
  if (availableSpells.length === 0) {
    useEffect(() => {
      nextStep();
    }, []);
    return null;
  }

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
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск заклинаний..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Доступные заклинания ({filteredSpells.length})</h3>
          <ScrollArea className="h-72 border rounded-md p-2">
            <div className="space-y-1">
              {filteredSpells.map((spell) => {
                const details = getSpellDetails(spell);
                
                return (
                  <HoverCard key={spell}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={() => toggleSpell(spell)}
                        disabled={!selectedSpells.includes(spell) && getSpellsRemaining() <= 0}
                        className={`w-full p-2 text-left text-sm rounded transition-colors ${
                          selectedSpells.includes(spell) 
                            ? "bg-green-500 text-white" 
                            : getSpellsRemaining() <= 0 
                              ? "bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed" 
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{spell}</span>
                          <Badge variant="outline" className={details?.school ? getSchoolColor(details.school) : ''}>
                            {details?.level === 0 ? "Заговор" : `${details?.level} круг`}
                          </Badge>
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{spell}</h4>
                          <Badge className={details?.school ? getSchoolColor(details.school) : ''}>
                            {details?.school}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2">{details?.description}</p>
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Классы: {details?.classes.join(", ")}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
              
              {filteredSpells.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  Нет заклинаний, соответствующих запросу
                </div>
              )}
            </div>
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

      {/* Navigation buttons */}
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
