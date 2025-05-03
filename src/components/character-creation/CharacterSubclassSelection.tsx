
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectionCard, SelectionCardGrid } from "@/components/ui/selection-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen } from "lucide-react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

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

// Данные для отображения архетипов
const subclassData: Record<string, any> = {
  "Воин": {
    "Мастер боя": {
      description: "Мастера боя - непревзойденные воины, которые совершенствуют свои боевые навыки до уровня искусства. Применяя особые приемы, они расширяют свои возможности в бою.",
      features: [
        {
          title: "Боевое превосходство",
          level: 3,
          description: "Вы изучаете приёмы, называемые манёврами, которые усиливаются костями превосходства."
        },
        {
          title: "Немало повидавший",
          level: 7,
          description: "Вы можете добавить половину бонуса мастерства (с округлением вниз) ко всем проверкам Силы, Ловкости и Телосложения, если они ещё не используют бонус мастерства."
        },
        {
          title: "Дополнительный приём",
          level: 10,
          description: "Вы изучаете дополнительный боевой приём."
        }
      ]
    },
    "Чемпион": {
      description: "Чемпионы воплощают в себе чистое военное совершенство. Они улучшают свои физические способности и мастерство в бою до сверхчеловеческого уровня.",
      features: [
        {
          title: "Улучшенный критический удар",
          level: 3,
          description: "Ваши атаки оружием совершают критическое попадание при выпадении на к20 значения 19 или 20."
        },
        {
          title: "Выдающийся атлет",
          level: 7,
          description: "Вы добавляете половину бонуса мастерства (округляя вверх) к проверкам Силы, Ловкости или Телосложения, которые ещё не имеют вашего бонуса мастерства."
        },
        {
          title: "Дополнительный боевой стиль",
          level: 10,
          description: "Вы изучаете ещё один вариант умения Боевой стиль, доступного для класса воина."
        }
      ]
    },
    "Рыцарь эльдрича": {
      description: "Рыцари эльдрича сочетают боевую доблесть воина с изучением магии. Они используют магические способности для усиления своих боевых приёмов.",
      features: [
        {
          title: "Использование заклинаний",
          level: 3,
          description: "Вы можете накладывать заклинания мага. Ваша основная характеристика для заклинаний — Интеллект."
        },
        {
          title: "Связь оружия",
          level: 3,
          description: "Вы проводите ритуал связывания с оружием. Его можно призывать как бонусное действие, и нельзя разоружить."
        },
        {
          title: "Военная магия",
          level: 7,
          description: "Когда вы используете ваше действие для накладывания заклинания, вы можете совершить одну атаку оружием как бонусное действие."
        }
      ]
    }
  },
  // Другие классы и их архетипы можно добавить здесь
};

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
    if (selectedSubclass) {
      updateCharacter({ subclass: selectedSubclass });
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
        allowNext={!!selectedSubclass}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubclassSelection;
