
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CharacterSheet, CharacterSpell } from '@/types/character';
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
  const [selectedSpells, setSelectedSpells] = useState<string[]>(Array.isArray(character.spells) ? 
    character.spells.map(spell => typeof spell === 'string' ? spell : spell.name) : []);
  
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [spellDetails, setSpellDetails] = useState<CharacterSpell | null>(null);

  useEffect(() => {
    if (character.class || character.className) {
      const className = character.className || character.class;
      const spells = getSpellsByClass(className);
      setAvailableSpells(spells);
    }
  }, [character.class, character.className]);

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
    if (spell) {
      setSpellDetails(spell);
    } else {
      setSpellDetails(null);
    }
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
          <div className="mt-4 p-4 border rounded">
            <h3 className="text-lg font-bold">{spellDetails.name}</h3>
            <p><strong>Уровень:</strong> {spellDetails.level}</p>
            <p><strong>Школа:</strong> {spellDetails.school}</p>
            <p><strong>Время накладывания:</strong> {spellDetails.castingTime}</p>
            <p><strong>Дальность:</strong> {spellDetails.range}</p>
            <p><strong>Компоненты:</strong> {spellDetails.components}</p>
            <p><strong>Длительность:</strong> {spellDetails.duration}</p>
            <p className="mt-2"><strong>Описание:</strong> {spellDetails.description}</p>
            {spellDetails.higherLevels && (
              <p className="mt-2"><strong>На больших уровнях:</strong> {spellDetails.higherLevels}</p>
            )}
            {spellDetails.higherLevel && !spellDetails.higherLevels && (
              <p className="mt-2"><strong>На больших уровнях:</strong> {spellDetails.higherLevel}</p>
            )}
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
