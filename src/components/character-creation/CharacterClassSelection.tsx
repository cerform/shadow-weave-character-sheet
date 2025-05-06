
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { getAllClasses, getClassDetails } from "@/data/classes/index"; 
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SelectionCard,
  SelectionCardGrid 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";
import { subclassData } from "@/data/subclasses";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Book, Swords, Award } from "lucide-react";

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

// Компонент для отображения особенностей класса
const ClassFeatureItem = ({ feature }: { feature: any }) => (
  <div className="mb-4 border-l-2 border-primary/50 pl-3">
    <h4 className="font-medium text-base">{feature.name}</h4>
    <p className="text-sm text-muted-foreground">{feature.level} уровень</p>
    <p className="text-sm mt-1">{feature.description}</p>
  </div>
);

// Компонент для отображения таблицы данных о классе
const ClassInfoTable = ({ classDetails }: { classDetails: any }) => (
  <div className="grid grid-cols-2 gap-4 mt-4">
    <div>
      <h4 className="font-medium text-sm">Кость здоровья</h4>
      <p className="text-sm">d{classDetails.hitDice}</p>
    </div>
    <div>
      <h4 className="font-medium text-sm">Основная характеристика</h4>
      <p className="text-sm">{Array.isArray(classDetails.primaryAbility) 
        ? classDetails.primaryAbility.join(", ")
        : classDetails.primaryAbility}</p>
    </div>
    <div>
      <h4 className="font-medium text-sm">Спасброски</h4>
      <p className="text-sm">{Array.isArray(classDetails.savingThrows) 
        ? classDetails.savingThrows.join(", ")
        : classDetails.savingThrows}</p>
    </div>
    {classDetails.spellcasting && (
      <div>
        <h4 className="font-medium text-sm">Характеристика заклинаний</h4>
        <p className="text-sm">{classDetails.spellcasting.ability}</p>
      </div>
    )}
  </div>
);

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
  const [selectedSubclass, setSelectedSubclass] = useState<string>(character.subclass || "");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [subclassActiveTab, setSubclassActiveTab] = useState<string>("description");
  const [classes, setClasses] = useState<any[]>([]);
  const [classDetails, setClassDetails] = useState<any>(null);
  const { toast } = useToast();

  // Загружаем классы при инициализации
  useEffect(() => {
    const loadClasses = async () => {
      const allClasses = getAllClasses();
      setClasses(allClasses);
    };
    loadClasses();
  }, []);

  // Загружаем детали выбранного класса
  useEffect(() => {
    if (selectedClass) {
      const details = getClassDetails(selectedClass);
      setClassDetails(details);
    } else {
      setClassDetails(null);
    }
  }, [selectedClass]);

  // Проверяем, есть ли подклассы для выбранного класса
  const hasSubclasses = (className: string) => {
    if (!className) return false;
    const classSubclasses = subclassData[className];
    return classSubclasses && Object.keys(classSubclasses).length > 0;
  };

  // Получаем доступные архетипы для выбранного класса
  const getAvailableSubclasses = () => {
    if (!selectedClass) return [];
    const classData = subclassData[selectedClass];
    return classData ? Object.keys(classData) : [];
  };

  const availableSubclasses = getAvailableSubclasses();

  // Сброс выбранного подкласса при изменении класса
  useEffect(() => {
    setSelectedSubclass("");
  }, [selectedClass]);

  // Получаем информацию о выбранном архетипе
  const getSubclassInfo = () => {
    if (!selectedClass || !selectedSubclass) return null;
    return subclassData[selectedClass]?.[selectedSubclass];
  };

  const subclassInfo = getSubclassInfo();

  // Получаем иконку для архетипа в зависимости от класса
  const getIconForSubclass = () => {
    if (!selectedClass) return <Award className="h-6 w-6 text-purple-400" />;
    
    const baseClass = selectedClass.toLowerCase();
    
    if (baseClass.includes('паладин') || baseClass.includes('жрец')) {
      return <ShieldCheck className="h-6 w-6 text-yellow-400" />;
    } else if (baseClass.includes('воин') || baseClass.includes('варвар')) {
      return <Swords className="h-6 w-6 text-red-400" />;
    } else if (baseClass.includes('волшебник') || baseClass.includes('чародей') || baseClass.includes('колдун')) {
      return <Book className="h-6 w-6 text-blue-400" />;
    }
    
    return <Award className="h-6 w-6 text-purple-400" />;
  };

  const handleNext = () => {
    if (selectedClass) {
      // Сохраняем текущий класс и подкласс (если выбран)
      const updates: any = { class: selectedClass };
      
      // Если есть подклассы и подкласс выбран, сохраняем его
      if (hasSubclasses(selectedClass) && selectedSubclass) {
        updates.subclass = selectedSubclass;
        toast({
          title: "Класс и специализация выбраны",
          description: `Вы выбрали класс ${selectedClass} со специализацией ${selectedSubclass}`,
        });
      } else if (hasSubclasses(selectedClass)) {
        // Если есть подклассы, но подкласс не выбран
        toast({
          title: "Выберите специализацию",
          description: "Пожалуйста, выберите специализацию для вашего класса.",
          variant: "destructive",
        });
        return; // Прерываем выполнение, не переходим дальше
      } else {
        // Если подклассов нет
        toast({
          title: "Класс выбран",
          description: `Вы выбрали класс ${selectedClass}`,
        });
      }
      
      updateCharacter(updates);
      nextStep();
    } else {
      toast({
        title: "Выберите класс",
        description: "Пожалуйста, выберите класс персонажа перед продолжением.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <SectionHeader
        title="Выберите класс"
        description="Класс определяет основные способности вашего персонажа и стиль игры."
      />
      
      <SelectionCardGrid>
        {classes.map((cls) => (
          <SelectionCard
            key={cls.name}
            title={cls.name}
            description={cls.description || "Описание будет добавлено..."}
            selected={selectedClass === cls.name} 
            onClick={() => setSelectedClass(cls.name)}
          />
        ))}
      </SelectionCardGrid>

      {classDetails && (
        <div className="mt-8 bg-card/20 p-5 rounded-lg border">
          <h3 className="text-xl font-medium mb-3">{classDetails.name}</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="features">Особенности</TabsTrigger>
              <TabsTrigger value="proficiencies">Владения</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-64 rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <p>{classDetails.description || "Описание будет добавлено..."}</p>
                <ClassInfoTable classDetails={classDetails} />
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <div className="space-y-2">
                  {classDetails.features && classDetails.features.map((feature: any, index: number) => (
                    <ClassFeatureItem key={index} feature={feature} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="proficiencies" className="mt-0">
                <div className="space-y-4">
                  {classDetails.armorProficiencies && classDetails.armorProficiencies.length > 0 && (
                    <div>
                      <h4 className="font-medium">Владение доспехами</h4>
                      <p className="text-sm">{classDetails.armorProficiencies.join(', ')}</p>
                    </div>
                  )}
                  
                  {classDetails.weaponProficiencies && classDetails.weaponProficiencies.length > 0 && (
                    <div>
                      <h4 className="font-medium">Владение оружием</h4>
                      <p className="text-sm">{classDetails.weaponProficiencies.join(', ')}</p>
                    </div>
                  )}
                  
                  {classDetails.toolProficiencies && classDetails.toolProficiencies.length > 0 && (
                    <div>
                      <h4 className="font-medium">Владение инструментами</h4>
                      <p className="text-sm">{classDetails.toolProficiencies.join(', ')}</p>
                    </div>
                  )}
                  
                  {classDetails.skillChoices && classDetails.skillChoices.length > 0 && (
                    <div>
                      <h4 className="font-medium">Доступные навыки</h4>
                      <p className="text-sm">Выберите {classDetails.skillCount} из: {classDetails.skillChoices.join(', ')}</p>
                    </div>
                  )}

                  {classDetails.equipment && classDetails.equipment.length > 0 && (
                    <div>
                      <h4 className="font-medium">Начальное снаряжение</h4>
                      <ul className="text-sm list-disc pl-5">
                        {classDetails.equipment.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      {/* Секция выбора специализации (архетипа) */}
      {selectedClass && hasSubclasses(selectedClass) && (
        <div className="mt-8">
          <Separator className="my-6" />
          
          <SectionHeader
            title={`Выберите специализацию для ${selectedClass}`}
            description="Специализация определяет уникальные способности и развитие вашего персонажа."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {availableSubclasses.map((subclass) => {
              const isSelected = selectedSubclass === subclass;
              const iconElement = getIconForSubclass();
              
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
                    {subclassData[selectedClass]?.[subclass]?.description?.substring(0, 100)}...
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
            <div className="mt-8 border-primary/30 bg-gradient-to-b from-gray-900/90 to-black/95 shadow-lg p-4 rounded-lg">
              <div className="border-b border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  {getIconForSubclass()}
                  <h3 className="text-2xl text-yellow-300">{selectedSubclass}</h3>
                </div>
              </div>
              <div className="pt-4">
                <Tabs value={subclassActiveTab} onValueChange={setSubclassActiveTab} className="w-full">
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
              </div>
            </div>
          )}
        </div>
      )}

      <NavigationButtons
        allowNext={!!selectedClass && (!hasSubclasses(selectedClass) || !!selectedSubclass)}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterClassSelection;
