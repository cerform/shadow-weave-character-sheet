
import React, { useState, useMemo } from 'react';
import NavigationButtons from './NavigationButtons';
import { classes } from '@/data/classes';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface SubclassOption {
  name: string;
  description: string;
  features: {
    name: string;
    description: string;
  }[];
}

interface CharacterSubclassSelectionProps {
  character: {
    class: string;
    level: number;
    subclass?: string;
  };
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Получаем доступные подклассы для класса на определенном уровне
const getAvailableSubclasses = (characterClass: string): SubclassOption[] => {
  switch (characterClass) {
    case 'Паладин':
      return [
        {
          name: 'Клятва Преданности',
          description: 'Паладины, принесшие Клятву Преданности, связывают себя с идеалами справедливости, добродетели и порядка.',
          features: [
            { 
              name: 'Принципы Преданности', 
              description: 'Честность: не лги и не жульничай. Позволь своему слову быть своими обязательствами. Храбрость: никогда не бойся действовать, хотя предусмотрительность является мудростью. Сострадание: помогай другим, защищай слабых и наказывай тех, кто угрожает им. Честь: относись к другим с честностью и позволь своим честным делам быть примером для них. Долг: будь ответственным за свои действия и их последствия, защищай тех, кто доверен твоей заботе, и повинуйся тем, у кого есть власть над тобой.' 
            },
            { 
              name: 'Заклинания клятвы', 
              description: 'Вы получаете доступ к следующим заклинаниям: 3 уровень — защита от добра и зла, очистительный удар; 5 уровень — малое восстановление, область истины; 9 уровень — рассеивание магии, возрождение; 13 уровень — страж веры, свобода перемещения; 17 уровень — общение, обет' 
            },
            { 
              name: 'Божественный канал', 
              description: 'Вы получаете два варианта использования Божественного канала: Священное оружие и Аура преданности.' 
            }
          ]
        },
        {
          name: 'Клятва Древних',
          description: 'Паладины, принесшие Клятву Древних, связывают себя со светом, радостью и красотой природы.',
          features: [
            { 
              name: 'Принципы Древних', 
              description: 'Разжигай Свет: через свои действия и поступки, позволь свету надежды, радости и жизни сиять. Храни Свет: там, где есть добро, красота, любовь и смех в мире, выступи против злых сил, которые хотят уничтожить это. Сам стань Светом: будь маяком, который несет радость, ясность и тепло в своем бесконечном свете.' 
            },
            { 
              name: 'Заклинания клятвы', 
              description: 'Вы получаете следующие заклинания: 3 уровень — опутывание, разговор с животными; 5 уровень — лунный луч, туманный шаг; 9 уровень — защита от энергии, рост растений; 13 уровень — ледяной шторм, каменная кожа; 17 уровень — общение с природой, древесный путь' 
            },
            { 
              name: 'Божественный канал', 
              description: 'Вы получаете два варианта использования Божественного канала: Гнев природы и Обращение неверных.' 
            }
          ]
        },
        {
          name: 'Клятва Мести',
          description: 'Паладины, принесшие Клятву Мести, стремятся наказать тех, кто совершил тяжкие грехи.',
          features: [
            { 
              name: 'Принципы Мести', 
              description: 'Сражайся со Злом: страх, слабость и сострадание не могут помешать мне наказывать нечестивцев. Никакой Милости Виновным: обычное милосердие не имеет места рядом с виновными, поскольку оно не останавливает зла. Если требуются наказания, они должны быть быстрыми и окончательными. Правосудие Превыше Всего: добродетель не должна просто побеждать, но и торжествовать над злом.' 
            },
            { 
              name: 'Заклинания клятвы', 
              description: 'Вы получаете следующие заклинания: 3 уровень — проклятие, бесследное передвижение; 5 уровень — удержание личности, туманный шаг; 9 уровень — мигающая собака, ускорение; 13 уровень — изгнание, каменная кожа; 17 уровень — общение, удержание чудовища' 
            },
            { 
              name: 'Божественный канал', 
              description: 'Вы получаете два варианта использования Божественного канала: Устрашающий вид и Клятвенный враг.' 
            }
          ]
        }
      ];
    case 'Воин':
      return [
        {
          name: 'Мастер боевых искусств',
          description: 'Вы посвятили себя изучению боевых искусств и совершенствованию своей техники владения оружием.',
          features: [
            { 
              name: 'Боевое превосходство', 
              description: 'Вы получаете боевые приемы, которые можно использовать для выполнения особых атак и манёвров в бою.' 
            },
            { 
              name: 'Превосходящая критическая атака', 
              description: 'Ваши атаки оружием совершают критическое попадание при результате броска 19-20 на к20.' 
            }
          ]
        },
        {
          name: 'Мистический рыцарь',
          description: 'Вы дополняете свои боевые навыки способностью накладывать заклинания.',
          features: [
            { 
              name: 'Использование заклинаний', 
              description: 'Вы можете накладывать заклинания волшебника. Интеллект — ваша базовая характеристика для накладывания заклинаний.' 
            },
            { 
              name: 'Боевая магия', 
              description: 'Когда вы используете действие для накладывания заклинания, вы можете совершить одну атаку оружием бонусным действием.' 
            }
          ]
        },
        {
          name: 'Чемпион',
          description: 'Архетип Чемпиона фокусируется на развитии грубой физической мощи для достижения сокрушительного совершенства в бою.',
          features: [
            { 
              name: 'Улучшенная критическая атака', 
              description: 'Ваши атаки оружием совершают критическое попадание при результате броска 19-20 на к20.' 
            },
            { 
              name: 'Замечательный атлет', 
              description: 'Вы получаете бонус к проверкам Силы (Атлетика) и Ловкости (Акробатика), равный половине бонуса мастерства.' 
            }
          ]
        }
      ];
    case 'Бард':
      return [
        {
          name: 'Коллегия Знаний',
          description: 'Барды Коллегии Знаний ценят знания и обучение выше всего.',
          features: [
            { 
              name: 'Дополнительные мастерства', 
              description: 'Вы изучаете 3 новых навыка мастерства на ваш выбор.' 
            },
            { 
              name: 'Обрывки знаний', 
              description: 'Вы можете добавить половину своего бонуса мастерства (округляя в меньшую сторону) к любой проверке характеристики, к которой вы ещё не добавляете бонус мастерства.' 
            }
          ]
        },
        {
          name: 'Коллегия Доблести',
          description: 'Барды Коллегии Доблести используют магию вдохновения для воодушевления своих союзников и устрашения противников.',
          features: [
            { 
              name: 'Бонусное владение', 
              description: 'Вы получаете владение средними доспехами и щитами.' 
            },
            { 
              name: 'Боевое вдохновение', 
              description: 'Вы можете вдохновить других, используя свои слова или музыку. Любое существо, которое имеет кость бардовского вдохновения от вас, может потратить её и добавить к броску атаки или броску урона.' 
            }
          ]
        }
      ];
    case 'Жрец':
      return [
        {
          name: 'Домен Жизни',
          description: 'Домен Жизни сосредоточен на энергии, которая поддерживает всю жизнь.',
          features: [
            { 
              name: 'Бонусное владение', 
              description: 'Вы получаете владение тяжелыми доспехами.' 
            },
            { 
              name: 'Ученик жизни', 
              description: 'Ваши заклинания исцеления становятся более эффективными. Всякий раз, когда вы используете заклинание 1-го уровня или выше для восстановления хитов существа, оно восстанавливает дополнительные хиты в размере 2 + уровень заклинания.' 
            }
          ]
        },
        {
          name: 'Домен Света',
          description: 'Божества света, включая Латандера, Пелора и Хельма, продвигают идеалы возрождения и обновления.',
          features: [
            { 
              name: 'Заговор вспышка', 
              description: 'Когда вы выбираете этот домен на 1 уровне, вы получаете заговор вспышка, если вы ещё не знаете его.' 
            },
            { 
              name: 'Сияющий блеск', 
              description: 'Также на 1 уровне вы можете использовать свой Божественный канал, чтобы создать вспышку света, раскрывающую и разгоняющую тьму. Действием вы можете активировать яркий свет, исходящий от вас радиусом 30 футов и тусклый свет на дополнительные 30 футов.' 
            }
          ]
        }
      ];
    case 'Варвар':
      return [
        {
          name: 'Путь Берсерка',
          description: 'Для некоторых варваров ярость — это средство достижения цели, которая заключается в насилии.',
          features: [
            { 
              name: 'Безумство', 
              description: 'Когда вы выбираете этот путь на 3 уровне, вы можете ввергнуть себя в безумие во время ярости. Если вы так делаете, то в течение своего хода, но после того как вошли в ярость, вы можете совершить одну атаку рукопашным оружием бонусным действием.' 
            }
          ]
        },
        {
          name: 'Путь Тотемного Воина',
          description: 'Путь Тотемного Воина — это духовное путешествие, во время которого варвар принимает дух животного в качестве руководства, защиты и источника вдохновения.',
          features: [
            { 
              name: 'Искатель Духа', 
              description: 'Вы можете накладывать заклинание разговор с животными как ритуал.' 
            },
            { 
              name: 'Дух Тотема', 
              description: 'Выберите тотемный дух и его преимущество: Медведь, Орел или Волк. Каждый дух даёт различные преимущества.' 
            }
          ]
        }
      ];
    // Добавим другие классы по мере необходимости
    default:
      return [];
  }
};

// Проверяем, доступен ли выбор подкласса на данном уровне
const isSubclassAvailable = (characterClass: string, level: number): boolean => {
  switch (characterClass) {
    case 'Воин':
    case 'Плут':
    case 'Варвар':
    case 'Бард':
    case 'Друид':
    case 'Колдун':
    case 'Монах':
      return level >= 3;
    case 'Паладин':
    case 'Следопыт':
      return level >= 3;
    case 'Жрец':
    case 'Волшебник':
      return level >= 2;
    case 'Чародей':
      return level >= 1;
    default:
      return false;
  }
};

const CharacterSubclassSelection: React.FC<CharacterSubclassSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [selectedSubclass, setSelectedSubclass] = useState<string>(character.subclass || "");
  
  // Получаем доступные подклассы для данного класса
  const availableSubclasses = useMemo(() => 
    getAvailableSubclasses(character.class), 
    [character.class]
  );
  
  // Проверяем доступность выбора подкласса
  const subclassAvailable = useMemo(() => 
    isSubclassAvailable(character.class, character.level), 
    [character.class, character.level]
  );

  // Выбранный подкласс с дополнительной информацией
  const selectedSubclassDetails = useMemo(() => 
    availableSubclasses.find(subclass => subclass.name === selectedSubclass), 
    [availableSubclasses, selectedSubclass]
  );
  
  // Обработчик для перехода к следующему шагу
  const handleNext = () => {
    if (selectedSubclass || !subclassAvailable) {
      updateCharacter({ subclass: selectedSubclass });
      nextStep();
    }
  };

  if (!subclassAvailable) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Выбор специализации</h2>
        <p className="text-muted-foreground">
          На {character.level} уровне класса {character.class} специализация еще недоступна.
        </p>
        <p className="text-muted-foreground text-sm">
          {character.class === "Воин" && "Воины выбирают боевой архетип на 3-м уровне."}
          {character.class === "Паладин" && "Паладины приносят священную клятву на 3-м уровне."}
          {character.class === "Жрец" && "Жрецы выбирают божественный домен на 1-м уровне."}
          {character.class === "Варвар" && "Варвары выбирают первобытный путь на 3-м уровне."}
          {character.class === "Бард" && "Барды выбирают коллегию бардов на 3-м уровне."}
          {character.class === "Следопыт" && "Следопыты выбирают архетип следопыта на 3-м уровне."}
        </p>
        
        <NavigationButtons
          allowNext={true}
          nextStep={handleNext}
          prevStep={prevStep}
          nextLabel="Далее"
          prevLabel="Назад"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Выберите специализацию</h2>
      
      <p className="text-muted-foreground mb-4">
        На {character.level} уровне ваш {character.class} должен выбрать специализацию.
        {character.class === "Паладин" && " Паладины приносят священную клятву, которая определяет их роль."}
        {character.class === "Воин" && " Воины выбирают боевой архетип, которому они будут следовать."}
        {character.class === "Варвар" && " Варвары выбирают первобытный путь, определяющий источник их ярости."}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {availableSubclasses.map((subclass) => (
          <Card 
            key={subclass.name}
            className={`cursor-pointer transition-all ${
              selectedSubclass === subclass.name 
                ? "border-primary shadow-md" 
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedSubclass(subclass.name)}
          >
            <CardHeader>
              <CardTitle>{subclass.name}</CardTitle>
              <CardDescription>{subclass.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant={selectedSubclass === subclass.name ? "default" : "outline"}
                className="w-full"
                onClick={() => setSelectedSubclass(subclass.name)}
              >
                {selectedSubclass === subclass.name ? "Выбрано" : "Выбрать"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedSubclassDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedSubclassDetails.name}</CardTitle>
            <CardDescription>{selectedSubclassDetails.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {selectedSubclassDetails.features.map((feature, index) => (
                  <div key={index}>
                    <h3 className="font-semibold">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
