
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';

interface Props {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<Props> = ({ character, updateCharacter, nextStep, prevStep }) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(character.spells || []);
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [activeTab, setActiveTab] = useState<string>("0");

  // Определяем максимальное количество заклинаний, которые может выбрать персонаж
  const getMaxSpellsCount = () => {
    // Это примерные цифры, их нужно адаптировать под правила D&D 5e
    const classSpellCounts: Record<string, number> = {
      "Волшебник": 6 + Math.max(0, Math.floor((character.abilityScores?.intelligence || 10) - 10) / 2),
      "Жрец": 4 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2),
      "Друид": 4 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2),
      "Бард": 4 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Колдун": 2 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Паладин": 2 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Следопыт": 2 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2)
    };
    
    return classSpellCounts[character.class] || 0;
  };

  const getAvailableSpellLevels = () => {
    // Каждый класс имеет доступ к разным уровням заклинаний в зависимости от своего уровня
    const characterLevel = character.level || 1;
    
    // Примерные значения, нужно будет адаптировать под правила D&D 5e
    if (characterLevel >= 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (characterLevel >= 13) return [0, 1, 2, 3, 4, 5, 6, 7];
    if (characterLevel >= 9) return [0, 1, 2, 3, 4, 5];
    if (characterLevel >= 5) return [0, 1, 2, 3];
    if (characterLevel >= 3) return [0, 1, 2];
    return [0, 1];
  };

  useEffect(() => {
    if (character.class) {
      // Получаем заклинания для класса персонажа
      const classSpells = getSpellsByClass(character.class);
      // Фильтруем по доступным уровням
      const availableLevels = getAvailableSpellLevels();
      const filteredSpells = classSpells.filter(spell => 
        spell && availableLevels.includes(spell.level || 0)
      );
      
      setAvailableSpells(filteredSpells);
    }
  }, [character.class, character.level]);

  const handleSelectSpell = (spell: CharacterSpell) => {
    if (selectedSpells.some(s => s.name === spell.name)) {
      // Если заклинание уже выбрано, удаляем его
      setSelectedSpells(selectedSpells.filter(s => s.name !== spell.name));
    } else {
      // Проверяем лимит заклинаний
      if (selectedSpells.length < getMaxSpellsCount()) {
        setSelectedSpells([...selectedSpells, spell]);
      } else {
        // Можно добавить оповещение о том, что достигнут лимит заклинаний
        alert(`Вы не можете выбрать больше ${getMaxSpellsCount()} заклинаний`);
      }
    }
  };

  const handleSaveSpells = () => {
    updateCharacter({
      spells: selectedSpells
    });
    nextStep();
  };

  const spellLevels = getAvailableSpellLevels();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Выбор заклинаний</h2>
      
      <div className="flex justify-between">
        <div>
          <Label>Класс: {character.class}</Label>
        </div>
        <div>
          <Label>Выбрано заклинаний: {selectedSpells.length} / {getMaxSpellsCount()}</Label>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {spellLevels.map(level => (
            <TabsTrigger key={level} value={level.toString()}>
              {level === 0 ? "Заговоры" : `Уровень ${level}`}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {spellLevels.map(level => (
          <TabsContent key={level} value={level.toString()}>
            <Card>
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 gap-2">
                    {availableSpells
                      .filter(spell => spell && spell.level === level)
                      .map((spell, index) => (
                        <Button 
                          key={index}
                          variant={selectedSpells.some(s => s.name === spell.name) ? "default" : "outline"}
                          className="justify-start text-left h-auto py-2"
                          onClick={() => handleSelectSpell(spell)}
                        >
                          <div>
                            <div className="font-bold">{spell.name}</div>
                            <div className="text-sm opacity-70">{spell.school} • {spell.castingTime}</div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleSaveSpells}
        nextLabel="Далее: Снаряжение"
        disableNext={character.class && getMaxSpellsCount() > 0 && selectedSpells.length === 0}
      />
    </div>
  );
};

export default CharacterSpellSelection;
