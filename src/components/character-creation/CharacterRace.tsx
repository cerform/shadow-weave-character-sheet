import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import NavigationButtons from './NavigationButtons';

// Update the interface to not require nextStep and prevStep
interface CharacterRaceProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  races: any[]; // Replace with proper type when available
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterRace: React.FC<CharacterRaceProps> = ({
  character,
  onUpdate,
  races,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [selectedRace, setSelectedRace] = useState<string>(character.race || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredRaces, setFilteredRaces] = useState(races);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter races when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRaces(races);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = races.filter(race => 
      race.name.toLowerCase().includes(lowercaseSearch) || 
      race.description.toLowerCase().includes(lowercaseSearch)
    );
    
    setFilteredRaces(filtered);
  }, [searchTerm, races]);

  // Group races by source book
  const racesBySource = filteredRaces.reduce((acc: Record<string, any[]>, race) => {
    const source = race.source || 'Unknown';
    if (!acc[source]) acc[source] = [];
    acc[source].push(race);
    return acc;
  }, {});

  // Handle race selection
  const handleRaceSelect = (raceName: string) => {
    setSelectedRace(raceName);
    
    // Find the selected race object
    const race = races.find(r => r.name === raceName);
    
    // Update character with race information
    if (race) {
      onUpdate({ 
        race: raceName,
        // Reset subrace when changing race
        subrace: undefined,
        // Apply racial ability score increases if available
        ...(race.abilityScoreIncrease && {
          abilities: {
            ...character.abilities,
            // Apply specific ability increases
            STR: (character.abilities?.STR || 10) + (race.abilityScoreIncrease.strength || 0),
            DEX: (character.abilities?.DEX || 10) + (race.abilityScoreIncrease.dexterity || 0),
            CON: (character.abilities?.CON || 10) + (race.abilityScoreIncrease.constitution || 0),
            INT: (character.abilities?.INT || 10) + (race.abilityScoreIncrease.intelligence || 0),
            WIS: (character.abilities?.WIS || 10) + (race.abilityScoreIncrease.wisdom || 0),
            CHA: (character.abilities?.CHA || 10) + (race.abilityScoreIncrease.charisma || 0),
            // Also update the long-form names for compatibility
            strength: (character.abilities?.strength || 10) + (race.abilityScoreIncrease.strength || 0),
            dexterity: (character.abilities?.dexterity || 10) + (race.abilityScoreIncrease.dexterity || 0),
            constitution: (character.abilities?.constitution || 10) + (race.abilityScoreIncrease.constitution || 0),
            intelligence: (character.abilities?.intelligence || 10) + (race.abilityScoreIncrease.intelligence || 0),
            wisdom: (character.abilities?.wisdom || 10) + (race.abilityScoreIncrease.wisdom || 0),
            charisma: (character.abilities?.charisma || 10) + (race.abilityScoreIncrease.charisma || 0),
          }
        }),
        // Apply speed if available
        ...(race.speed && { speed: race.speed }),
        // Apply racial features if available
        ...(race.features && { 
          raceFeatures: race.features.map((feature: any) => ({
            name: feature.name,
            description: feature.description,
            source: raceName
          }))
        })
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    // Check if race has subraces
    const selectedRaceObj = races.find(r => r.name === selectedRace);
    
    if (selectedRaceObj && selectedRaceObj.subraces && selectedRaceObj.subraces.length > 0) {
      // If race has subraces, go to subrace selection
      nextStep();
    } else {
      // If no subraces, skip to class selection
      nextStep();
      // Optionally skip another step if needed
      // nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Выберите расу персонажа</h2>
        <p className="text-muted-foreground">
          Раса определяет базовые характеристики вашего персонажа, включая бонусы к характеристикам и особые способности.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Поиск рас..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Race selection tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">Все расы</TabsTrigger>
          <TabsTrigger value="phb">Базовые</TabsTrigger>
          <TabsTrigger value="other">Дополнительные</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRaces.map((race) => (
                <Card 
                  key={race.name}
                  className={`cursor-pointer transition-all ${
                    selectedRace === race.name ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleRaceSelect(race.name)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{race.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {race.description.substring(0, 100)}...
                    </div>
                    {race.abilityScoreIncrease && (
                      <div className="text-xs mt-2">
                        <span className="font-medium">Бонусы к характеристикам:</span>{' '}
                        {Object.entries(race.abilityScoreIncrease)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)} +${value}`)
                          .join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="phb">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRaces
                .filter(race => race.source === 'PHB')
                .map((race) => (
                  <Card 
                    key={race.name}
                    className={`cursor-pointer transition-all ${
                      selectedRace === race.name ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleRaceSelect(race.name)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{race.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {race.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="other">
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRaces
                .filter(race => race.source !== 'PHB')
                .map((race) => (
                  <Card 
                    key={race.name}
                    className={`cursor-pointer transition-all ${
                      selectedRace === race.name ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleRaceSelect(race.name)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{race.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {race.description.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Selected race details */}
      {selectedRace && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Выбрана раса: {selectedRace}</h3>
          {races.find(r => r.name === selectedRace)?.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {races.find(r => r.name === selectedRace)?.description}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRace;
