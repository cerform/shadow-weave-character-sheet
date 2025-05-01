
import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { races } from "@/data/races";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CharacterRaceSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterRaceSelection: React.FC<CharacterRaceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedRace, setSelectedRace] = useState<string>(character.race || "");
  const [selectedSubrace, setSelectedSubrace] = useState<string>(character.subrace || "");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleNext = () => {
    updateCharacter({
      race: selectedRace,
      subrace: selectedSubrace,
    });
    nextStep();
  };

  // Find the selected race from data
  const selectedRaceData = races.find((race) => race.name === selectedRace);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите расу</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {races.map((race) => (
          <button
            key={race.name}
            onClick={() => {
              setSelectedRace(race.name);
              setSelectedSubrace("");
            }}
            className={`p-4 border rounded transition-all ${
              selectedRace === race.name 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-background hover:bg-muted/20"
            }`}
          >
            <div className="font-semibold">{race.name}</div>
            <div className="text-sm text-muted-foreground">{race.description.split('.')[0]}.</div>
          </button>
        ))}
      </div>

      {selectedRaceData && (
        <div className="mb-8 bg-card/20 p-4 rounded-lg border">
          <h3 className="text-xl font-medium mb-3">{selectedRaceData.name}</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="traits">Особенности</TabsTrigger>
              <TabsTrigger value="subraces">Подрасы</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-64 rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <p>{selectedRaceData.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-sm">Бонусы к характеристикам</h4>
                    <p className="text-sm">{selectedRaceData.abilityBonuses}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Продолжительность жизни</h4>
                    <p className="text-sm">{selectedRaceData.lifespan}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Мировоззрение</h4>
                    <p className="text-sm">{selectedRaceData.alignment}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Размер</h4>
                    <p className="text-sm">{selectedRaceData.size}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Скорость</h4>
                    <p className="text-sm">{selectedRaceData.speed}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Языки</h4>
                    <p className="text-sm">{selectedRaceData.languages}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="traits" className="mt-0">
                <div className="space-y-4">
                  {selectedRaceData.traits.map((trait, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{trait.name}</h4>
                      <p className="text-sm text-muted-foreground">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="subraces" className="mt-0">
                {selectedRaceData.subRaces && selectedRaceData.subRaces.length > 0 ? (
                  <div className="space-y-4">
                    <p className="mb-4">Выберите подрасу:</p>
                    {selectedRaceData.subRaces.map((subrace, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSubrace(subrace)}
                        className={`block w-full text-left p-3 border rounded ${
                          selectedSubrace === subrace ? "bg-primary/20 border-primary" : ""
                        }`}
                      >
                        {subrace}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>У этой расы нет подрас.</p>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
