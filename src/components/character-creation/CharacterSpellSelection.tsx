
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book } from "lucide-react";
import { toast } from "sonner";

interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

interface CharacterSpellSelectionProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterSpellSelection = ({ character, onUpdateCharacter }: CharacterSpellSelectionProps) => {
  const [selectedSpells, setSelectedSpells] = useState<string[]>(character.spells || []);
  const [maxCantrips, setMaxCantrips] = useState(3);
  const [maxSpells, setMaxSpells] = useState(4);
  
  // Mock spell data - in a real app, this would come from an API or data file
  const availableSpells: Record<string, Spell[]> = {
    "Волшебник": [
      { name: "Огненный снаряд", level: 0, school: "Воплощение", castingTime: "1 действие", range: "120 футов", components: "В, С", duration: "Мгновенная", description: "Метание огненного снаряда, наносящего урон 1d10." },
      { name: "Свет", level: 0, school: "Воплощение", castingTime: "1 действие", range: "Касание", components: "В, М", duration: "1 час", description: "Заставляет объект светиться." },
      { name: "Волшебная рука", level: 0, school: "Вызов", castingTime: "1 действие", range: "30 футов", components: "В, С", duration: "1 минута", description: "Создает призрачную руку, которая может манипулировать объектами." },
      { name: "Малая иллюзия", level: 0, school: "Иллюзия", castingTime: "1 действие", range: "30 футов", components: "С, М", duration: "1 минута", description: "Создает звук или изображение по вашему выбору." },
      { name: "Волшебный снаряд", level: 1, school: "Воплощение", castingTime: "1 действие", range: "120 футов", components: "В, С", duration: "Мгновенная", description: "Создает три светящихся дротика, каждый наносящий 1d4+1 урона." },
      { name: "Щит", level: 1, school: "Ограждение", castingTime: "1 реакция", range: "На себя", components: "В, С", duration: "1 раунд", description: "+5 к КД, иммунитет к волшебному снаряду." },
      { name: "Обнаружение магии", level: 1, school: "Прорицание", castingTime: "1 действие", range: "На себя", components: "В, С", duration: "Концентрация, до 10 минут", description: "Обнаруживает близлежащую магию." },
      { name: "Сон", level: 1, school: "Очарование", castingTime: "1 действие", range: "90 футов", components: "В, С, М", duration: "1 минута", description: "Погружает существ в магический сон (5d8 хитов)." },
    ],
    "Жрец": [
      { name: "Свет", level: 0, school: "Воплощение", castingTime: "1 действие", range: "Касание", components: "В, М", duration: "1 час", description: "Заставляет объект светиться." },
      { name: "Сопротивление", level: 0, school: "Ограждение", castingTime: "1 действие", range: "Касание", components: "В, С, М", duration: "Концентрация, до 1 минуты", description: "+d4 к одному спасброску." },
      { name: "Указание", level: 0, school: "Прорицание", castingTime: "1 действие", range: "30 футов", components: "В, С", duration: "Концентрация, до 1 минуты", description: "Даёт преимущество на следующую проверку характеристики." },
      { name: "Лечение ран", level: 1, school: "Воплощение", castingTime: "1 действие", range: "Касание", components: "В, С", duration: "Мгновенная", description: "Восстанавливает 1d8 + модификатор заклинаний хитов." },
      { name: "Благословение", level: 1, school: "Очарование", castingTime: "1 действие", range: "30 футов", components: "В, С, М", duration: "Концентрация, до 1 минуты", description: "До 3 существ получают +d4 к броскам атаки и спасброскам." },
      { name: "Приказ", level: 1, school: "Очарование", castingTime: "1 действие", range: "60 футов", components: "В", duration: "1 раунд", description: "Заставляет цель выполнить одно действие: подойти, упасть, бежать, отдать, остановиться." },
    ],
    "Бард": [
      { name: "Малая иллюзия", level: 0, school: "Иллюзия", castingTime: "1 действие", range: "30 футов", components: "С, М", duration: "1 минута", description: "Создает звук или изображение по вашему выбору." },
      { name: "Насмешка", level: 0, school: "Очарование", castingTime: "1 действие", range: "60 футов", components: "В", duration: "1 минута", description: "Цель получает помеху на следующий бросок атаки." },
      { name: "Волшебная рука", level: 0, school: "Вызов", castingTime: "1 действие", range: "30 футов", components: "В, С", duration: "1 минута", description: "Создает призрачную руку, которая может манипулировать объектами." },
      { name: "Очарование личности", level: 1, school: "Очарование", castingTime: "1 действие", range: "30 футов", components: "В, С", duration: "1 час", description: "Заставляет одно существо считать вас другом." },
      { name: "Лечащее слово", level: 1, school: "Воплощение", castingTime: "1 бонусное действие", range: "60 футов", components: "В", duration: "Мгновенная", description: "Восстанавливает 1d4 + модификатор заклинаний хитов." },
      { name: "Героизм", level: 1, school: "Очарование", castingTime: "1 действие", range: "Касание", components: "В, С", duration: "Концентрация, до 1 минуты", description: "Цель получает временные хиты в начале каждого своего хода." },
    ]
  };
  
  useEffect(() => {
    if (character.class) {
      // Set available spells based on class and level
      switch (character.class) {
        case "Волшебник":
          setMaxCantrips(3 + Math.floor(character.level / 4));
          setMaxSpells(character.level + Math.max(0, Math.floor((character.abilities.intelligence - 10) / 2)));
          break;
        case "Жрец":
        case "Друид":
          setMaxCantrips(3 + Math.floor(character.level / 4));
          setMaxSpells(character.level + Math.max(0, Math.floor((character.abilities.wisdom - 10) / 2)));
          break;
        case "Бард":
          setMaxCantrips(2 + Math.floor(character.level / 4));
          setMaxSpells(character.level + Math.max(0, Math.floor((character.abilities.charisma - 10) / 2)));
          break;
        default:
          setMaxCantrips(0);
          setMaxSpells(0);
      }
    }
  }, [character.class, character.level, character.abilities]);
  
  const handleSpellToggle = (spellName: string) => {
    let newSelectedSpells;
    
    if (selectedSpells.includes(spellName)) {
      newSelectedSpells = selectedSpells.filter(name => name !== spellName);
    } else {
      const spell = getSpellByName(spellName);
      
      if (spell) {
        // Check if we're at the limit for this spell level
        const selectedCantripCount = getSelectedSpellsByLevel(0).length;
        const selectedSpellCount = getSelectedSpellsByLevel(1).length;
        
        if (spell.level === 0 && selectedCantripCount >= maxCantrips) {
          toast.error(`Вы не можете выбрать больше ${maxCantrips} заговоров`);
          return;
        }
        
        if (spell.level === 1 && selectedSpellCount >= maxSpells) {
          toast.error(`Вы не можете выбрать больше ${maxSpells} заклинаний`);
          return;
        }
      }
      
      newSelectedSpells = [...selectedSpells, spellName];
    }
    
    setSelectedSpells(newSelectedSpells);
    onUpdateCharacter({ spells: newSelectedSpells });
  };
  
  const getSpellByName = (name: string): Spell | undefined => {
    const classSpells = availableSpells[character.class];
    if (!classSpells) return undefined;
    
    return classSpells.find(spell => spell.name === name);
  };
  
  const getSelectedSpellsByLevel = (level: number): Spell[] => {
    return selectedSpells
      .map(name => getSpellByName(name))
      .filter((spell): spell is Spell => spell !== undefined && spell.level === level);
  };
  
  if (!character.class || !availableSpells[character.class]) {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Для выбранного класса нет доступных заклинаний или класс не обладает магией.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор заклинаний</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Book size={20} />
              <h3 className="text-lg font-semibold">Заговоры</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Доступно: {getSelectedSpellsByLevel(0).length}/{maxCantrips}
            </p>
            <ScrollArea className="h-60 rounded-md border p-2">
              {availableSpells[character.class]
                .filter(spell => spell.level === 0)
                .map(spell => (
                  <div key={spell.name} className="flex items-start space-x-2 py-2">
                    <Checkbox
                      id={`spell-${spell.name}`}
                      checked={selectedSpells.includes(spell.name)}
                      onCheckedChange={() => handleSpellToggle(spell.name)}
                      disabled={!selectedSpells.includes(spell.name) && getSelectedSpellsByLevel(0).length >= maxCantrips}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`spell-${spell.name}`}>{spell.name}</Label>
                      <p className="text-sm text-muted-foreground">{spell.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {spell.school} • {spell.castingTime} • {spell.range}
                      </p>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Book size={20} />
              <h3 className="text-lg font-semibold">Заклинания 1 уровня</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Доступно: {getSelectedSpellsByLevel(1).length}/{maxSpells}
            </p>
            <ScrollArea className="h-60 rounded-md border p-2">
              {availableSpells[character.class]
                .filter(spell => spell.level === 1)
                .map(spell => (
                  <div key={spell.name} className="flex items-start space-x-2 py-2">
                    <Checkbox
                      id={`spell-${spell.name}`}
                      checked={selectedSpells.includes(spell.name)}
                      onCheckedChange={() => handleSpellToggle(spell.name)}
                      disabled={!selectedSpells.includes(spell.name) && getSelectedSpellsByLevel(1).length >= maxSpells}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`spell-${spell.name}`}>{spell.name}</Label>
                      <p className="text-sm text-muted-foreground">{spell.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {spell.school} • {spell.castingTime} • {spell.range}
                      </p>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
