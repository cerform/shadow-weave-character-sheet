
import React, { useState, useEffect } from "react";
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
import { Book, ShieldCheck, Swords, Award } from "lucide-react";

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
        
        // Показываем уведомление о выборе архетипа
        toast({
          title: "Архетип выбран",
          description: `Вы выбрали: ${selectedSubclass}`,
        });
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
  
  // Если для класса нет доступных подклассов, сообщаем пользователю
  if (availableSubclasses.length === 0) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title="Архетипы недоступны"
          description={`Для класса ${character.class} нет доступных архетипов. Вы можете перейти к следующему шагу.`}
        />
        <NavigationButtons
          allowNext={true}
          nextStep={nextStep}
          prevStep={prevStep}
          isFirstStep={false}
        />
      </div>
    );
  }

  // Получаем иконку для архетипа в зависимости от класса
  const getIconForSubclass = (subclass: string) => {
    const baseClass = character.class.toLowerCase();
    
    if (baseClass.includes('паладин') || baseClass.includes('жрец')) {
      return <ShieldCheck className="h-6 w-6 text-yellow-400" />;
    } else if (baseClass.includes('воин') || baseClass.includes('варвар')) {
      return <Swords className="h-6 w-6 text-red-400" />;
    } else if (baseClass.includes('волшебник') || baseClass.includes('чародей') || baseClass.includes('колдун')) {
      return <Book className="h-6 w-6 text-blue-400" />;
    }
    
    return <Award className="h-6 w-6 text-purple-400" />;
  };
  
  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Выберите специализацию для класса ${character.class}`}
        description="Специализация определяет уникальные способности и развитие вашего персонажа."
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {availableSubclasses.map((subclass) => {
          const isSelected = selectedSubclass === subclass;
          const iconElement = getIconForSubclass(subclass);
          
          return (
            <div 
              key={subclass}
              className={`
                p-6 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300
                ${isSelected ? 'scale-105 border-2 border-yellow-500 bg-gradient-to-b from-gray-900/90 to-black/90' : 'border border-gray-700 bg-gray-800/50 hover:bg-gray-800'}
              `}
              onClick={() => setSelectedSubclass(subclass)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className={`
                    rounded-full p-2 flex-shrink-0
                    ${isSelected ? 'bg-yellow-500/20' : 'bg-gray-700/50'}
                  `}
                >
                  {iconElement}
                </div>
                <h3 className={`font-bold text-xl ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                  {subclass}
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                {subclassData[character.class]?.[subclass]?.description?.substring(0, 100)}...
              </p>
              <div className={`
                text-xs px-2 py-1 rounded-full inline-block
                ${isSelected ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/50' : 'bg-gray-700 text-gray-300'} 
              `}>
                {isSelected ? 'Выбрано' : 'Нажмите для выбора'}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedSubclass && subclassInfo && (
        <Card className="mt-8 border-primary/30 bg-gradient-to-b from-gray-900/90 to-black/95 shadow-lg">
          <CardHeader className="border-b border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              {getIconForSubclass(selectedSubclass)}
              <CardTitle className="text-2xl text-yellow-300">{selectedSubclass}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-black/50 border border-gray-700">
                <TabsTrigger 
                  value="description" 
                  className="data-[state=active]:bg-blue-900/60 data-[state=active]:text-white data-[state=inactive]:text-gray-400"
                >
                  Описание
                </TabsTrigger>
                <TabsTrigger 
                  value="features" 
                  className="data-[state=active]:bg-purple-900/60 data-[state=active]:text-white data-[state=inactive]:text-gray-400"
                >
                  Особенности
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-64 rounded-md border border-gray-700 p-4 bg-black/40">
                <TabsContent value="description" className="mt-0">
                  <p className="text-white leading-relaxed">{subclassInfo.description}</p>
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
