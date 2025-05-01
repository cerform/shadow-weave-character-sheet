
import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { classes } from "@/data/classes";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CharacterClassSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterClassSelection: React.FC<CharacterClassSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(character.class || "");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleNext = () => {
    if (selectedClass) {
      updateCharacter({ class: selectedClass });
      nextStep();
    }
  };

  // Find the selected class details
  const selectedClassDetails = classes.find(c => c.name === selectedClass);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите класс</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {classes.map((cls) => (
          <button
            key={cls.name}
            onClick={() => setSelectedClass(cls.name)}
            className={`p-4 border rounded transition-all ${
              selectedClass === cls.name 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-background hover:bg-muted/20"
            }`}
          >
            <div className="font-semibold">{cls.name}</div>
            <div className="text-sm text-muted-foreground">{cls.description}</div>
          </button>
        ))}
      </div>

      {selectedClassDetails && (
        <div className="mb-8 bg-card/20 p-4 rounded-lg border">
          <h3 className="text-xl font-medium mb-3">{selectedClassDetails.name}</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="features">Особенности</TabsTrigger>
              <TabsTrigger value="proficiencies">Владения</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-64 rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <p>{selectedClassDetails.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-sm">Кость здоровья</h4>
                    <p className="text-sm">{selectedClassDetails.hitDie}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Основная характеристика</h4>
                    <p className="text-sm">{selectedClassDetails.primaryAbility}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Спасброски</h4>
                    <p className="text-sm">{selectedClassDetails.savingThrows}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <div className="space-y-4">
                  {selectedClassDetails.features.map((feature, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="proficiencies" className="mt-0">
                <p>{selectedClassDetails.proficiencies}</p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <NavigationButtons
        allowNext={!!selectedClass}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterClassSelection;
