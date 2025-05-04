import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CharacterSheet } from '@/types/character';
import { getSpellsByClass } from '@/data/spells';

interface CharacterSpellSelectionProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpells, setSelectedSpells] = useState<string[]>(character.spells as string[] || []);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);
  const [spellDetails, setSpellDetails] = useState<any>(null);

  useEffect(() => {
    if (character.class) {
      const spells = getSpellsByClass(character.class);
      setAvailableSpells(spells);
    }
  }, [character.class]);

  const handleSpellSelect = (spellName: string) => {
    if (selectedSpells.includes(spellName)) {
      setSelectedSpells(selectedSpells.filter(name => name !== spellName));
    } else {
      setSelectedSpells([...selectedSpells, spellName]);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredSpells = availableSpells.filter(spell =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSpellSelected = (spellName: string) => {
    return selectedSpells.includes(spellName);
  };

  const handleSaveSpells = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  const getSpellDetails = (spellName: string) => {
    const spell = availableSpells.find(spell => spell.name === spellName);
    setSpellDetails(spell);
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Выбор заклинаний</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            {/* Добавьте другие категории заклинаний, если необходимо */}
          </TabsList>
          <div className="mt-4">
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpells.map(spell => (
                  <div key={spell.name} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={spell.name}
                      className="h-4 w-4 rounded text-primary shadow-sm focus:ring-primary"
                      checked={isSpellSelected(spell.name)}
                      onChange={() => handleSpellSelect(spell.name)}
                    />
                    <label htmlFor={spell.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {spell.name}
                    </label>
                    <Badge onClick={() => getSpellDetails(spell.name)} variant="secondary" className="cursor-pointer">
                      Подробнее
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            {/* Добавьте другие TabsContent, если необходимо */}
          </div>
        </Tabs>
        {spellDetails && (
          <div className="mt-4">
            <h3>{spellDetails.name}</h3>
            <p>Уровень: {spellDetails.level}</p>
            <p>Школа: {spellDetails.school}</p>
            <p>Описание: {spellDetails.description}</p>
            {/* Добавьте другие детали заклинания, если необходимо */}
          </div>
        )}
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={prevStep}>
            Назад
          </Button>
          <Button onClick={handleSaveSpells}>Сохранить и продолжить</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterSpellSelection;
