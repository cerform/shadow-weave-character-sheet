
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectionCard, SelectionCardGrid } from "@/components/ui/selection-card";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { subclassData } from "@/data/subclasses";

// Компонент для улучшенного отображения особенностей подклассов
const FeatureItem = ({ title, level, description }: { title: string; level: number; description: string }) => (
  <div className="bg-black/50 border border-primary/30 rounded-md p-3 mb-3">
    <div className="flex justify-between items-center mb-1">
      <h4 className="font-medium text-lg text-yellow-300">{title}</h4>
      <span className="text-xs font-medium bg-primary/30 px-2 py-1 rounded text-white">
        {level} уровень
      </span>
    </div>
    <p className="text-sm text-white/90">{description}</p>
  </div>
);

interface CharacterSubclassSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSubclassSelection: React.FC<CharacterSubclassSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>(character.subclass || "");
  const [activeTab, setActiveTab] = useState<string>("description");
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Получаем доступные архетипы для класса персонажа
  const getAvailableSubclasses = () => {
    if (!character.class) return [];
    
    // Получаем из данных или возвращаем пустой массив
    const classData = subclassData[character.class];
    return classData ? Object.keys(classData) : [];
  };
  
  const availableSubclasses = getAvailableSubclasses();
  
  const handleNext = () => {
    if (selectedSubclass || availableSubclasses.length === 0) {
      if (selectedSubclass) {
        updateCharacter({ subclass: selectedSubclass });
      }
      nextStep();
    } else {
      toast({
        title: "Выберите архетип",
        description: "Пожалуйста, выберите архетип для вашего класса.",
        variant: "destructive",
      });
    }
  };
  
  // Получаем информацию о выбранном архетипе
  const getSubclassInfo = () => {
    if (!character.class || !selectedSubclass) return null;
    return subclassData[character.class]?.[selectedSubclass];
  };
  
  const subclassInfo = getSubclassInfo();
  
  // Если для класса нет доступных подклассов, сразу переходим к следующему шагу
  if (availableSubclasses.length === 0) {
    // Добавляем setTimeout, чтобы не блокировать рендеринг
    setTimeout(() => {
      nextStep();
    }, 0);
    return null;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Выберите специализацию для класса ${character.class}`}
        description="Специализация определяет уникальные способности и развитие вашего персонажа."
      />
      
      <SelectionCardGrid>
        {availableSubclasses.map((subclass) => (
          <SelectionCard
            key={subclass}
            title={subclass}
            description={subclassData[character.class]?.[subclass]?.description || ""}
            selected={selectedSubclass === subclass}
            onClick={() => setSelectedSubclass(subclass)}
            // Принудительно задаем светлый текст
            titleClassName="text-yellow-300 text-xl" 
            descriptionClassName="text-white/90"
            className={`${selectedSubclass === subclass ? 'border-yellow-500' : 'border-primary/30'} bg-black/70`}
          />
        ))}
      </SelectionCardGrid>
      
      {selectedSubclass && subclassInfo && (
        <Card className="mt-8 border-primary/30 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-white">{selectedSubclass}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4 bg-black/50">
                <TabsTrigger 
                  value="description" 
                  className="data-[state=active]:text-white data-[state=active]:bg-primary data-[state=inactive]:text-white/80"
                >
                  Описание
                </TabsTrigger>
                <TabsTrigger 
                  value="features" 
                  className="data-[state=active]:text-white data-[state=active]:bg-primary data-[state=inactive]:text-white/80"
                >
                  Особенности
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-64 rounded-md border p-4 bg-black/40">
                <TabsContent value="description" className="mt-0">
                  <p className="text-white">{subclassInfo.description}</p>
                </TabsContent>
                
                <TabsContent value="features" className="mt-0 space-y-4">
                  {subclassInfo.features.map((feature: any, index: number) => (
                    <FeatureItem 
                      key={index}
                      title={feature.title}
                      level={feature.level}
                      description={feature.description}
                    />
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <NavigationButtons
        allowNext={!!selectedSubclass || availableSubclasses.length === 0}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubclassSelection;
