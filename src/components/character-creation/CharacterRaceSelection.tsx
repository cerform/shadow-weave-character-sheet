
import React, { useState, useEffect } from "react";
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

  // Reset selected subrace when race changes
  useEffect(() => {
    setSelectedSubrace("");
  }, [selectedRace]);
  
  const handleNext = () => {
    const selectedRaceData = races.find((race) => race.name === selectedRace);
    const needsSubrace = selectedRaceData?.subRaces && selectedRaceData.subRaces.length > 0;
    
    // Can't proceed if subrace is needed but not selected
    if (needsSubrace && !selectedSubrace) {
      return;
    }
    
    updateCharacter({
      race: selectedRace,
      subrace: selectedSubrace,
    });
    nextStep();
  };

  // Find the selected race from data
  const selectedRaceData = races.find((race) => race.name === selectedRace);
  const hasSubraces = selectedRaceData?.subRaces && selectedRaceData.subRaces.length > 0;
  const canProceed = selectedRace && (!hasSubraces || selectedSubrace);

  // Get subrace details if available
  const getSubraceDetails = () => {
    if (selectedRaceData?.subRaceDetails && selectedSubrace) {
      return selectedRaceData.subRaceDetails[selectedSubrace];
    }
    return null;
  };

  const subraceDetails = getSubraceDetails();

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
              {hasSubraces && (
                <TabsTrigger value="subraces">Подрасы</TabsTrigger>
              )}
            </TabsList>
            
            <ScrollArea className="h-64 rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <p>{selectedRaceData.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-sm">Бонусы к характеристикам</h4>
                    <p className="text-sm">
                      {selectedSubrace && subraceDetails ? subraceDetails.abilityBonuses : selectedRaceData.abilityBonuses}
                    </p>
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
                  {/* Display base race traits */}
                  {selectedRaceData.traits.map((trait, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{trait.name}</h4>
                      <p className="text-sm text-muted-foreground">{trait.description}</p>
                    </div>
                  ))}
                  
                  {/* Display subrace traits if available */}
                  {selectedSubrace && subraceDetails && subraceDetails.traits && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-lg mb-2">Особенности подрасы: {selectedSubrace}</h4>
                      {subraceDetails.traits.map((trait: any, index: number) => (
                        <div key={`subrace-${index}`} className="mt-2">
                          <h5 className="font-medium">{trait.name}</h5>
                          <p className="text-sm text-muted-foreground">{trait.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {hasSubraces && (
                <TabsContent value="subraces" className="mt-0">
                  <div className="space-y-4">
                    <p className="mb-4">Выберите подрасу:</p>
                    
                    {selectedRaceData.subRaces.map((subrace, index) => {
                      const subraceDetail = selectedRaceData.subRaceDetails?.[subrace];
                      
                      return (
                        <div key={index} 
                          className={`block w-full text-left p-4 border rounded transition-colors ${
                            selectedSubrace === subrace ? "bg-primary/20 border-primary" : "hover:bg-muted/30"
                          }`}
                          onClick={() => setSelectedSubrace(subrace)}
                        >
                          <h4 className="font-medium text-base">{subrace}</h4>
                          
                          {subraceDetail && (
                            <>
                              <p className="text-sm mt-1 text-muted-foreground">{subraceDetail.description}</p>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Бонусы к характеристикам: </span>
                                {subraceDetail.abilityBonuses}
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <NavigationButtons
        allowNext={canProceed}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
