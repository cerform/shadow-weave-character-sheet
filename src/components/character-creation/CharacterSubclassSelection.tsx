
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { CharacterSubclass } from "@/types/character";
import { useToast } from "@/hooks/use-toast";

// Данные о подклассах
const subclasses: CharacterSubclass[] = [
  // Подклассы Воина
  {
    name: "Мастер боя",
    className: "Воин",
    description: "Мастера боя - непревзойденные воины, которые совершенствуют свои боевые навыки до уровня искусства. Применяя особые приемы, они расширяют свои возможности в бою.",
    features: [
      { level: 3, name: "Боевое превосходство", description: "Вы изучаете приёмы, называемые манёврами, которые усиливаются костями превосходства." },
      { level: 7, name: "Немало повидавший", description: "Вы можете добавить половину бонуса мастерства (с округлением вниз) ко всем проверкам Силы, Ловкости и Телосложения, если они еще не используют бонус мастерства." },
      { level: 10, name: "Дополнительный прием", description: "Вы изучаете дополнительный боевой прием." },
    ]
  },
  {
    name: "Чемпион",
    className: "Воин",
    description: "Архетип чемпиона фокусируется на развитии грубой физической силы с совершенствованием смертоносности. Для тех, кто следует этому архетипу, имеет значение потенциально смертельный удар, потрясающее спасение или победа в соревновании.",
    features: [
      { level: 3, name: "Улучшенный критический удар", description: "Ваши атаки оружием совершают критическое попадание при выпадении на кубе 19 или 20." },
      { level: 7, name: "Замечательный атлет", description: "Вы добавляете половину бонуса мастерства (с округлением вверх) к проверкам Силы, Ловкости и Телосложения, если вы ещё не добавляете к ним бонус мастерства." },
      { level: 10, name: "Дополнительный боевой стиль", description: "Вы можете выбрать второй вариант из особенности «Боевой стиль»." },
    ]
  },
  {
    name: "Рыцарь эльдрича",
    className: "Воин",
    description: "Архетип рыцаря эльдрича сочетает мастерство и упорство воина с изучением магии. Рыцари эльдрича используют магические техники, схожие с теми, что используются волшебниками.",
    features: [
      { level: 3, name: "Заклинательная магия", description: "Вы дополняете свое воинское искусство заклинаниями." },
      { level: 7, name: "Магическое оружие", description: "Вы обучаетесь наполнять оружие, которое используете, магической энергией." },
      { level: 10, name: "Магическая защита", description: "Вы обучаетесь прерывать атаки по себе или рядом стоящему существу." },
    ]
  },
  
  // Подклассы Плута
  {
    name: "Вор",
    className: "Плут",
    description: "Вы оттачиваете навыки скрытного проникновения. Воры и разбойники следуют этому архетипу, также как и те плуты, что предпочитают думать о себе как о профессиональных охотниках за сокровищами, исследователях или следопытах.",
    features: [
      { level: 3, name: "Ловкие руки", description: "Вы можете использовать действие Бонусное действие, предоставляемое умением Хитрое действие, чтобы совершить проверку Ловкости (Ловкость рук), использовать воровские инструменты для обезвреживания ловушек или вскрытия замков, или же совершить действие Использование предмета." },
      { level: 3, name: "Второй этаж", description: "Когда вы взбираетесь, ваша скорость лазания равна скорости ходьбы. Кроме того, вы совершаете прыжки с разбега дальше обычного — на количество футов, равное вашему модификатору Ловкости." },
      { level: 9, name: "Превосходная скрытность", description: "Вы совершаете броски с преимуществом, когда прячетесь, если перемещаетесь в свой ход не более чем наполовину от своей скорости." },
    ]
  },
  {
    name: "Убийца",
    className: "Плут",
    description: "Вы фокусируетесь на убийстве. Вы обучаетесь ужасающим и эффективным техникам убийства и сосредотачиваете свои тренировки на этом кровавом искусстве.",
    features: [
      { level: 3, name: "Мастер убийства", description: "Вы обучаетесь наиболее эффективным способам убийства. Вы имеете преимущество в спасбросках от любого яда. Также вы получаете знание об использовании ядов, и можете пропитать любое рубящее или колющее оружие дозой яда в качестве бонусного действия вместо обычного." },
      { level: 3, name: "Убийственная профессия", description: "Вы получаете знание об использовании комплектов для маскировки и можете всегда действовать им грамотно. Кроме того, вы можете дублировать внешность другого человека за 3 часа, если будете изучать его поведение в течение трёх часов." },
      { level: 9, name: "Инфильтрация", description: "Вы можете создавать себе фальшивые личности. Для этого вам нужно потратить 7 дней и 25 зм на установление личности с контактами, историей, и так далее. Вы не можете установить личность, уже задействованную кем-то. Например, вы можете приобрести набор одежды, иметь при себе письма от выдуманных НИПов и знать местные обычаи." },
    ]
  },
  {
    name: "Мистический ловкач",
    className: "Плут",
    description: "Некоторые плуты усиливают свою скрытность и ловкость посредством магии, обучаясь основам заклинаний и используя магию в своей работе.",
    features: [
      { level: 3, name: "Заклинательная магия", description: "Вы получаете способность использовать заклинания волшебника." },
      { level: 3, name: "Ловкая рука мага", description: "Когда вы используете действие для сотворения заклинания волшебника, вы можете использовать бонусное действие для Хитрого действия, использования Скрытой атаки или Стремительной руки." },
      { level: 9, name: "Магическая амбидекстрия", description: "Вы получаете преимущество на спасброски против заклинаний." },
    ]
  },
  
  // Подклассы Волшебника
  {
    name: "Школа Преобразования",
    className: "Волшебник",
    description: "Вы направляете свои исследования на восемь школ магии, но предпочитаете заклинания школы Преобразования. Вы фокусируетесь на изменении энергии и материи.",
    features: [
      { level: 2, name: "Школьная специализация: Преобразование", description: "Когда вы выбираете эту школу на 2 уровне, золото и время, необходимое для копирования заклинаний Преобразования в вашу книгу заклинаний, уменьшается вдвое." },
      { level: 2, name: "Второстепенная алхимия", description: "Когда вы выбираете эту школу на 2 уровне, вы можете временно изменять физические свойства одного немагического объекта, изменяя его материал." },
      { level: 6, name: "Преобразователь", description: "Начиная с 6 уровня, вы можете использовать своё действие, чтобы преобразовать часть своей энергии в одну из перечисленных ниже выгод, которая длится 1 час." },
    ]
  },
  {
    name: "Школа Вызова",
    className: "Волшебник",
    description: "Как специалист по вызову, вы предпочитаете заклинания, которые создают объекты и существа из ничего. Вы можете найти заклинания, создающие оружие из силы, призывающие внеземных союзников или создающие безжизненные объекты из сырой материи.",
    features: [
      { level: 2, name: "Школьная специализация: Вызов", description: "Когда вы выбираете эту школу на 2 уровне, золото и время, необходимое для копирования заклинаний Вызова в вашу книгу заклинаний, уменьшается вдвое." },
      { level: 2, name: "Бережливый вызыватель", description: "Начиная со 2-го уровня, магическая энергия, которую вы используете для наложения заклинаний Вызова, растягивается ещё дальше. Если вы сотворяете заклинание Вызова, которое требует расхода одной или нескольких ячеек заклинания, вы восстанавливаете одну израсходованную ячейку, если уровень ячейки заклинания Вызова 1 или 2." },
      { level: 6, name: "Стабильная сила", description: "Ваше покорение явлений вызова улучшается. Всякий раз, когда вы сотворяете заклинание Вызова длительности в 1 минуту или дольше, его длительность удваивается (максимум до 24 часов)." },
    ]
  },
  
  // Другие подклассы для всех классов...
];

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
  const [filteredSubclasses, setFilteredSubclasses] = useState<CharacterSubclass[]>([]);
  const [activeTab, setActiveTab] = useState<string>("features");
  const { toast } = useToast();

  // Фильтруем подклассы для текущего класса при загрузке компонента
  useEffect(() => {
    if (character.class) {
      const classSubclasses = subclasses.filter(
        (subclass) => subclass.className === character.class
      );
      
      setFilteredSubclasses(classSubclasses);
      
      // Если нет подклассов для этого класса или подкласс уже выбран
      if (classSubclasses.length === 0) {
        toast({
          title: "Внимание",
          description: `Для класса "${character.class}" пока нет доступных подклассов.`,
        });
      }
    }
  }, [character.class, toast]);

  const handleNext = () => {
    // Если подкласс выбран или подклассов нет для данного класса (тогда просто продолжаем)
    if (selectedSubclass || filteredSubclasses.length === 0) {
      updateCharacter({ subclass: selectedSubclass });
      nextStep();
    } else {
      toast({
        title: "Выберите подкласс",
        description: "Пожалуйста, выберите подкласс перед продолжением.",
        variant: "destructive",
      });
    }
  };
  
  // Находим детали выбранного подкласса
  const selectedSubclassDetails = filteredSubclasses.find(
    (subclass) => subclass.name === selectedSubclass
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите специализацию для класса {character.class}</h2>
      
      {filteredSubclasses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {filteredSubclasses.map((subclass) => (
              <Card
                key={subclass.name}
                className={`p-4 cursor-pointer transition-all ${
                  selectedSubclass === subclass.name 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-background hover:bg-muted/20"
                }`}
                onClick={() => setSelectedSubclass(subclass.name)}
              >
                <h3 className="text-xl font-medium">{subclass.name}</h3>
                <p className="mt-2 text-sm">
                  {subclass.description.length > 150 
                    ? `${subclass.description.slice(0, 150)}...` 
                    : subclass.description}
                </p>
              </Card>
            ))}
          </div>

          {selectedSubclassDetails && (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-3">
                {selectedSubclassDetails.name}
              </h3>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="features">Особенности</TabsTrigger>
                  <TabsTrigger value="description">Описание</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features">
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="space-y-4">
                      {selectedSubclassDetails.features.map((feature, index) => (
                        <div key={index} className="space-y-1">
                          <h4 className="font-medium text-primary">
                            {feature.name} ({feature.level} уровень)
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="description">
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <p className="text-sm">{selectedSubclassDetails.description}</p>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8 bg-muted/20 rounded-lg mb-8">
          <p>Для класса "{character.class}" пока нет доступных подклассов.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Вы можете продолжить создание персонажа без выбора подкласса.
          </p>
        </div>
      )}

      <NavigationButtons
        allowNext={selectedSubclass !== "" || filteredSubclasses.length === 0}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubclassSelection;
