
import React, { useState, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

// Типы для монстров из бестиария
interface Monster {
  id: string;
  name: string;
  type: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  alignment: string;
  ac: number;
  hp: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  dexMod: number;
  challenge: number;
  xp: number;
  img?: string;
}

interface BestiaryPanelProps {
  addToMap: (monster: Monster) => void;
}

// Временный массив монстров из разных CR для примера
const BESTIARY_DATA: Monster[] = [
  {
    id: "goblin",
    name: "Гоблин",
    type: "Гуманоид",
    size: "Small",
    alignment: "Нейтрально-злой",
    ac: 15,
    hp: 7,
    speed: "30 фт.",
    str: 8,
    dex: 14,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
    dexMod: 2,
    challenge: 1/4,
    xp: 50,
    img: "/assets/tokens/goblin.png"
  },
  {
    id: "orc",
    name: "Орк",
    type: "Гуманоид",
    size: "Medium",
    alignment: "Хаотично-злой",
    ac: 13,
    hp: 15,
    speed: "30 фт.",
    str: 16,
    dex: 12,
    con: 16,
    int: 7,
    wis: 11,
    cha: 10,
    dexMod: 1,
    challenge: 1/2,
    xp: 100,
    img: "/assets/tokens/orc.png"
  },
  {
    id: "troll",
    name: "Тролль",
    type: "Великан",
    size: "Large",
    alignment: "Хаотично-злой",
    ac: 15,
    hp: 84,
    speed: "30 фт.",
    str: 18,
    dex: 13,
    con: 20,
    int: 7,
    wis: 9,
    cha: 7,
    dexMod: 1,
    challenge: 5,
    xp: 1800,
    img: "/assets/tokens/troll.png"
  },
  {
    id: "ogre",
    name: "Огр",
    type: "Великан",
    size: "Large",
    alignment: "Хаотично-злой",
    ac: 11,
    hp: 59,
    speed: "40 фт.",
    str: 19,
    dex: 8,
    con: 16,
    int: 5,
    wis: 7,
    cha: 7,
    dexMod: -1,
    challenge: 2,
    xp: 450,
    img: "/assets/tokens/ogre.png"
  },
  {
    id: "dragon_adult_red",
    name: "Взрослый красный дракон",
    type: "Дракон",
    size: "Huge",
    alignment: "Хаотично-злой",
    ac: 19,
    hp: 256,
    speed: "40 фт., летая 80 фт.",
    str: 27,
    dex: 10,
    con: 25,
    int: 16,
    wis: 13,
    cha: 21,
    dexMod: 0,
    challenge: 17,
    xp: 18000,
    img: "/assets/tokens/dragon.png"
  }
];

// Группировка монстров по CR для удобства
const CR_GROUPS = [
  { label: "0-1", min: 0, max: 1 },
  { label: "2-5", min: 2, max: 5 },
  { label: "6-10", min: 6, max: 10 },
  { label: "11-15", min: 11, max: 15 },
  { label: "16+", min: 16, max: 30 }
];

export const BestiaryPanel: React.FC<BestiaryPanelProps> = ({ addToMap }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCR, setSelectedCR] = useState<number>(-1);
  const [selectedType, setSelectedType] = useState<string>("");
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  // Получаем уникальные типы существ для фильтра
  const monsterTypes = useMemo(() => {
    const types = new Set<string>();
    BESTIARY_DATA.forEach(monster => types.add(monster.type));
    return Array.from(types);
  }, []);
  
  // Фильтрация монстров
  const filteredMonsters = useMemo(() => {
    return BESTIARY_DATA.filter(monster => {
      // Поиск по имени
      const nameMatch = monster.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Фильтр по уровню опасности
      const crMatch = selectedCR === -1 ? true : 
        (selectedCR >= 0 && 
         monster.challenge >= CR_GROUPS[selectedCR].min && 
         monster.challenge <= CR_GROUPS[selectedCR].max);
      
      // Фильтр по типу
      const typeMatch = !selectedType || monster.type === selectedType;
      
      return nameMatch && crMatch && typeMatch;
    });
  }, [searchTerm, selectedCR, selectedType]);
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="font-medium mb-2">Бестиарий D&D</h3>
      
      {/* Поиск */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск существ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* Фильтры */}
      <div className="mb-3 flex gap-2 flex-wrap">
        <div>
          <label className="block text-xs mb-1 text-muted-foreground">Уровень опасности (CR)</label>
          <div className="flex gap-1 flex-wrap">
            <Button 
              size="sm" 
              variant={selectedCR === -1 ? "default" : "outline"} 
              onClick={() => setSelectedCR(-1)}
              className="h-7 text-xs"
            >
              Все
            </Button>
            {CR_GROUPS.map((group, index) => (
              <Button 
                key={group.label} 
                size="sm" 
                variant={selectedCR === index ? "default" : "outline"}
                onClick={() => setSelectedCR(index === selectedCR ? -1 : index)}
                className="h-7 text-xs"
              >
                {group.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs mb-1 text-muted-foreground">Тип существа</label>
          <div className="flex gap-1 flex-wrap">
            <Button 
              size="sm" 
              variant={!selectedType ? "default" : "outline"} 
              onClick={() => setSelectedType("")}
              className="h-7 text-xs"
            >
              Все
            </Button>
            {monsterTypes.map(type => (
              <Button 
                key={type} 
                size="sm" 
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(selectedType === type ? "" : type)}
                className="h-7 text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Список монстров */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredMonsters.map(monster => (
            <div 
              key={monster.id}
              className="p-2 border rounded bg-card/50 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded overflow-hidden mr-3">
                  <img 
                    src={monster.img || `/assets/tokens/${monster.type.toLowerCase()}.png`} 
                    alt={monster.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{String(monster.name || 'Monster')}</div>
                  <div className="text-xs text-muted-foreground">
                    {String(monster.size || '')} {String(monster.type || '')} • CR {String(monster.challenge || '0')}
                  </div>
                  <div className="text-xs mt-1">
                    <span className="mr-2">AC: {Number(monster.ac || 0)}</span>
                    <span>HP: {Number(monster.hp || 0)}</span>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => addToMap(monster)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {filteredMonsters.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Ничего не найдено
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Действие по добавлению своего существа */}
      <div className="mt-3 pt-3 border-t">
        <Button 
          className="w-full"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать своё существо
        </Button>
      </div>
    </div>
  );
};
