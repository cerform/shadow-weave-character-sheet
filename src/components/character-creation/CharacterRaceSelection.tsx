
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { races } from "@/data/races";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import ThemeSelector from "@/components/ThemeSelector";
import {
  Tooltip,
  TooltipContent,
  ExtendedTooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Placeholder avatar URLs
const raceAvatars: Record<string, string> = {
  "Дварф": "/lovable-uploads/05efd541-6ce2-40b2-9b33-09af3c59e3d5.png", // Default dwarf
  "Эльф": "/lovable-uploads/181e96b3-24be-423e-b0cb-5814a8f72172.png",  // Default elf
  "Человек": "/lovable-uploads/f42db994-ba63-4160-b476-3ec2bb95c207.png", // Default human
  "Полуэльф": "/lovable-uploads/7a062655-27cc-43a9-bc21-fb65a1c04538.png", // Default half-elf
  // Add more race avatars as needed
};

// Helper function to get avatar URL
const getRaceAvatar = (raceName: string) => {
  return raceAvatars[raceName] || "/placeholder.svg";
};

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
  const [expandedRaceInfo, setExpandedRaceInfo] = useState<string | null>(null);
  const { theme } = useTheme();
  
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
  // Ensure canProceed is strictly a boolean value
  const canProceed = Boolean(selectedRace && (!hasSubraces || selectedSubrace));

  // Get subrace details if available
  const getSubraceDetails = () => {
    if (selectedRaceData?.subRaceDetails && selectedSubrace) {
      return selectedRaceData.subRaceDetails[selectedSubrace];
    }
    return null;
  };

  const subraceDetails = getSubraceDetails();
  
  // Get theme colors for styling
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Toggle race info expansion
  const toggleRaceInfo = (raceName: string) => {
    if (expandedRaceInfo === raceName) {
      setExpandedRaceInfo(null);
    } else {
      setExpandedRaceInfo(raceName);
    }
  };

  return (
    <div className="pb-20"> {/* Add padding at bottom for sticky navigation */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Выберите расу</h2>
        <ThemeSelector />
      </div>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {races.map((race) => {
          const isSelected = selectedRace === race.name;
          const hasSubraces = race.subRaces && race.subRaces.length > 0;
          const isExpanded = expandedRaceInfo === race.name;
          
          return (
            <div key={race.name} className="flex flex-col">
              <button
                onClick={() => {
                  setSelectedRace(race.name);
                  setSelectedSubrace("");
                }}
                className={`p-4 border rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col ${
                  isSelected 
                    ? "bg-primary/20 border-primary shadow-md" 
                    : "bg-background hover:bg-muted/20 hover:border-accent/50"
                }`}
                style={{
                  borderColor: isSelected ? currentTheme.accent : 'inherit',
                  boxShadow: isSelected ? `0 0 8px ${currentTheme.accent}40` : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 flex-shrink-0"
                    style={{ borderColor: currentTheme.accent }}
                  >
                    <img 
                      src={getRaceAvatar(race.name)} 
                      alt={race.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold flex items-center">
                      {race.name}
                      {isSelected && <Check className="ml-2 h-4 w-4 text-primary" />}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {race.description.split('.')[0]}.
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {hasSubraces && (
                    <Badge variant="outline" className="text-xs">
                      {race.subRaces.length} подрас{race.subRaces.length === 1 ? 'а' : 'ы'}
                    </Badge>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="text-xs bg-primary/20 text-primary-foreground/80">
                          {race.abilityBonuses}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Бонусы к характеристикам, получаемые при выборе этой расы</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </button>
              
              {hasSubraces && (
                <button 
                  onClick={() => toggleRaceInfo(race.name)}
                  className={`mt-1 text-sm flex items-center justify-center p-2 rounded transition-colors ${
                    isSelected ? "bg-primary/10 text-primary-foreground" : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {isExpanded ? (
                    <>Скрыть подрасы <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Показать подрасы <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </button>
              )}
              
              {/* Expanded subrace list */}
              {isExpanded && hasSubraces && race.subRaceDetails && (
                <div className="mt-2 bg-background/60 border rounded-lg p-2 animate-fade-in">
                  {race.subRaces.map((subrace) => {
                    const subraceDetail = race.subRaceDetails?.[subrace];
                    const isSubraceSelected = selectedSubrace === subrace && selectedRace === race.name;
                    
                    return (
                      <div 
                        key={subrace}
                        className={`block w-full text-left p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                          isSubraceSelected ? "bg-primary/20" : "hover:bg-muted/30"
                        }`}
                        onClick={() => {
                          setSelectedRace(race.name);
                          setSelectedSubrace(subrace);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-base">{subrace}</h4>
                          {isSubraceSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        
                        {subraceDetail && (
                          <>
                            <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                              {subraceDetail.description}
                            </p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-sm mt-1 font-medium">
                                    Бонусы: {subraceDetail.abilityBonuses}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Дополнительные бонусы к характеристикам подрасы</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedRaceData && (
        <div 
          className="mb-8 bg-card/20 p-4 rounded-lg border animate-fade-in"
          style={{
            borderColor: currentTheme.accent,
            boxShadow: `0 0 10px ${currentTheme.accent}30`
          }}
        >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-sm">Бонусы к характеристикам</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm">
                            {selectedSubrace && subraceDetails ? subraceDetails.abilityBonuses : selectedRaceData.abilityBonuses}
                          </p>
                        </TooltipTrigger>
                        <ExtendedTooltipContent>
                          <div>
                            <h4 className="font-bold">Бонусы к характеристикам</h4>
                            <p>Эти модификаторы добавляются к базовым значениям характеристик вашего персонажа.</p>
                            <p className="mt-2">Они отражают врождённые способности данной расы:</p>
                            <ul className="list-disc pl-5 mt-1">
                              {(selectedSubrace && subraceDetails ? subraceDetails.abilityBonuses : selectedRaceData.abilityBonuses)
                                .split(',')
                                .map((bonus, i) => (
                                  <li key={i}>{bonus.trim()}</li>
                                ))
                              }
                            </ul>
                          </div>
                        </ExtendedTooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    <div 
                      key={index} 
                      className="bg-background/50 p-3 rounded-md border" 
                      style={{ borderColor: `${currentTheme.accent}40` }}
                    >
                      <h4 className="font-medium">{trait.name}</h4>
                      <p className="text-sm text-muted-foreground">{trait.description}</p>
                    </div>
                  ))}
                  
                  {/* Display subrace traits if available */}
                  {selectedSubrace && subraceDetails && subraceDetails.traits && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-lg mb-2">Особенности подрасы: {selectedSubrace}</h4>
                      {subraceDetails.traits.map((trait: any, index: number) => (
                        <div 
                          key={`subrace-${index}`} 
                          className="bg-background/50 p-3 rounded-md mt-2 border" 
                          style={{ borderColor: `${currentTheme.accent}40` }}
                        >
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
                      const isSubraceSelected = selectedSubrace === subrace;
                      
                      return (
                        <div 
                          key={index} 
                          className={`block w-full text-left p-4 border rounded transition-colors cursor-pointer ${
                            isSubraceSelected ? "bg-primary/20 border-primary" : "hover:bg-muted/30"
                          }`}
                          style={{
                            borderColor: isSubraceSelected ? currentTheme.accent : 'inherit',
                            boxShadow: isSubraceSelected ? `0 0 5px ${currentTheme.accent}40` : 'none'
                          }}
                          onClick={() => setSelectedSubrace(subrace)}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-base">{subrace}</h4>
                            {isSubraceSelected && <Check className="h-5 w-5" />}
                          </div>
                          
                          {subraceDetail && (
                            <>
                              <p className="text-sm mt-1 text-muted-foreground">{subraceDetail.description}</p>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm mt-1">
                                      <span className="font-medium">Бонусы к характеристикам: </span>
                                      {subraceDetail.abilityBonuses}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Эти бонусы добавляются к базовым расовым характеристикам</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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

      {/* Sticky footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 z-10"
        style={{ borderColor: currentTheme.accent }}
      >
        <div className="container mx-auto max-w-4xl">
          <NavigationButtons
            allowNext={canProceed}
            nextStep={handleNext}
            prevStep={prevStep}
            isFirstStep={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterRaceSelection;
