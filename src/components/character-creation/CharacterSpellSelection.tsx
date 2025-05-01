
import React, { useState, useEffect } from "react";
import { SPELLS, SPELL_DETAILS } from "@/data/spells";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    if (character.class && SPELLS[character.class]) {
      const spellList = SPELLS[character.class];
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

  // Create a placeholder spell details if not available in our data
  const getSpellDetails = (spellName: string) => {
    if (SPELL_DETAILS[spellName]) {
      return SPELL_DETAILS[spellName];
    }
    return {
      level: 1,
      school: "Неизвестная",
      castingTime: "1 действие",
      range: "30 футов",
      duration: "Мгновенная",
      description: "Подробное описание заклинания недоступно."
    };
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
              {filteredSpells.map((spell) => (
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
                      {spell}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-semibold">{spell}</h4>
                        <span className="text-xs bg-primary/20 px-2 py-1 rounded">
                          {getSpellDetails(spell).level === 0 ? "Заговор" : `${getSpellDetails(spell).level} уровень`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{getSpellDetails(spell).school}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="font-medium">Время накладывания:</span> {getSpellDetails(spell).castingTime}
                        </div>
                        <div>
                          <span className="font-medium">Дистанция:</span> {getSpellDetails(spell).range}
                        </div>
                        <div>
                          <span className="font-medium">Длительность:</span> {getSpellDetails(spell).duration}
                        </div>
                      </div>
                      <p className="text-sm mt-2">{getSpellDetails(spell).description}</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
              
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
                selectedSpells.map((spell) => (
                  <button
                    key={spell}
                    onClick={() => toggleSpell(spell)}
                    className="w-full p-2 text-left text-sm rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    {spell}
                  </button>
                ))
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
