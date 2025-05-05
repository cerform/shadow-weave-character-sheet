
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';

interface ClassDetailsProps {
  cls: any;
  onBack: () => void;
}

const ClassDetails: React.FC<ClassDetailsProps> = ({ cls, onBack }) => {
  const [activeTab, setActiveTab] = useState("features");
  
  if (!cls) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Назад
        </Button>
        <h2 className="text-2xl font-bold ml-4">{cls.name}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto flex items-center"
        >
          <Download size={16} className="mr-1" />
          Экспорт в PDF
        </Button>
      </div>
      
      <p className="text-gray-700">{cls.description}</p>
      
      <Tabs defaultValue="features" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="features">Особенности</TabsTrigger>
          <TabsTrigger value="archetypes">Архетипы</TabsTrigger>
          <TabsTrigger value="progression">Развитие</TabsTrigger>
          <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Общая информация</h3>
              <p><strong>Кость хитов:</strong> {cls.hitDie}</p>
              <p><strong>Хиты на 1 уровне:</strong> {cls.hitPointsAtFirstLevel || `${cls.hitDie.replace('d', '')} + модификатор Телосложения`}</p>
              <p><strong>Хиты на следующих уровнях:</strong> {cls.hitPointsAtHigherLevels || `1${cls.hitDie} (или ${Math.floor(parseInt(cls.hitDie.replace('d', '')) / 2) + 1}) + модификатор Телосложения за каждый уровень после первого`}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Владения</h3>
              <p><strong>Спасброски:</strong> {cls.savingThrows}</p>
              <p><strong>Навыки:</strong> {cls.skillProficiencies || "Выбор из списка навыков класса"}</p>
              <p><strong>Оружие и доспехи:</strong> {cls.proficiencies}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Особенности класса</h3>
            <Accordion type="multiple" className="w-full">
              {cls.features && cls.features.map((feature: any, index: number) => (
                <AccordionItem key={index} value={`feature-${index}`}>
                  <AccordionTrigger>{feature.name}</AccordionTrigger>
                  <AccordionContent>
                    {feature.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {cls.isMagicClass && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Использование магии</h3>
              <p><strong>Базовая характеристика:</strong> {cls.spellcastingAbility}</p>
              <p><strong>Сложность спасброска:</strong> 8 + бонус мастерства + модификатор {cls.spellcastingAbility.toLowerCase()}</p>
              <p><strong>Модификатор атаки заклинанием:</strong> бонус мастерства + модификатор {cls.spellcastingAbility.toLowerCase()}</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archetypes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getArchetypes(cls.name).map((archetype, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle>{archetype.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{archetype.description}</p>
                  <h4 className="font-semibold text-sm mb-1">Основные особенности:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {archetype.features.map((feature: string, idx: number) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
            
            {getArchetypes(cls.name).length === 0 && (
              <div className="col-span-full text-center p-8 text-gray-500">
                <p>Информация об архетипах этого класса пока недоступна.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="progression">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Уровень</th>
                  <th className="p-2 border">Бонус мастерства</th>
                  <th className="p-2 border">Особенности</th>
                  {cls.isMagicClass && (
                    <>
                      <th className="p-2 border">Известные заклинания</th>
                      <th className="p-2 border">Ячейки заклинаний по уровням</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {generateProgressionTable(cls).map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-2 border text-center">{row.level}</td>
                    <td className="p-2 border text-center">+{row.proficiencyBonus}</td>
                    <td className="p-2 border">{row.features}</td>
                    {cls.isMagicClass && (
                      <>
                        <td className="p-2 border text-center">{row.knownSpells || "—"}</td>
                        <td className="p-2 border text-center">{row.spellSlots || "—"}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="equipment">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Начальное снаряжение</h3>
            <p className="mb-2">В качестве начального снаряжения вы получаете следующие вещи, а также всё, что даёт выбранная вами предыстория.</p>
            <ul className="list-disc pl-5 space-y-1">
              {cls.equipment && cls.equipment.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Получение архетипов для класса
function getArchetypes(className: string) {
  const archetypes: { [key: string]: Array<{ name: string; description: string; features: string[] }> } = {
    'Воин': [
      { 
        name: 'Мастер боевых искусств', 
        description: 'Мастер боевых искусств использует боевые приёмы, переданные через поколения. Для некоторых эта традиция — особенный стиль боя, который передаётся только ученикам. Для других это набор лучших техник, собранный за годы в трудах о войне и сражениях.',
        features: ['Боевое превосходство', 'Улучшенная критическая атака', 'Замечательный атлет', 'Дополнительный боевой стиль']
      },
      { 
        name: 'Чемпион', 
        description: 'Архетипический чемпион фокусируется на развитии грубой физической силы, превращённой в смертоносную эффективность. Те, кто моделируют себя по этому архетипу, сочетают здоровую тренировку с физическими упражнениями для достижения боевого совершенства.',
        features: ['Улучшенная критическая атака', 'Замечательный атлет', 'Дополнительный боевой стиль', 'Выживший']
      },
      { 
        name: 'Рыцарь Эльдричского Ордена', 
        description: 'Рыцарь Эльдричского Ордена совмещает боевое мастерство воина с изучением магии. Рыцари узнают несколько заклинаний и могут использовать энергию, называемую мистической аркой, для дальнейшего дополнения их боевых способностей.',
        features: ['Использование заклинаний', 'Оружие-защитник', 'Мистическая арка', 'Эльдрический удар']
      }
    ],
    'Бард': [
      { 
        name: 'Коллегия Знаний', 
        description: 'Барды Коллегии Знаний знают практически что угодно, собирая обрывки информации из источников столь же различных, как древние сказки и современные оды.',
        features: ['Дополнительные владения', 'Разрезанье словами', 'Дополнительные магические секреты', 'Непревзойдённая сверхъестественная защита']
      },
      { 
        name: 'Коллегия Доблести', 
        description: 'Барды Коллегии Доблести — настоящие рассказчики и прорицатели, которые своими музыкой и рассказами сохраняют память о великих свершениях прошлого. Они видят себя хранителями великих деяний.',
        features: ['Дополнительные владения', 'Боевое вдохновение', 'Дополнительная атака', 'Боевая магия']
      }
    ],
    'Жрец': [
      { 
        name: 'Домен Жизни', 
        description: 'Домен Жизни фокусируется на энергии, питающей всё живое. Боги жизни продвигают живучесть и здоровье, исцеляя больных и раненых, заботясь о нуждающихся и изгоняя силы смерти и нежити.',
        features: ['Бонусное владение', 'Ученик Жизни', 'Сохраняющая жизнь', 'Благословлённый целитель', 'Верховный целитель']
      },
      { 
        name: 'Домен Знания', 
        description: 'Боги знания ценят обучение и понимание превыше всего. Некоторые учат, что знание нужно собирать и делиться с помощью книг и рассказов, другие считают, что понимание приходит через опыт.',
        features: ['Бонусное владение', 'Благословение знаний', 'Направленные знания', 'Мощные заклинания', 'Видение прошлого']
      },
      { 
        name: 'Домен Света', 
        description: 'Боги света, включающие Латандера, Фелону, и Хеймдаля, продвигают идеалы возрождения и обновления, истины, бдительности, и красоты, часто используя символ солнца.',
        features: ['Бонусные заклинания', 'Использование фокусировки жреца', 'Защитная вспышка', 'Мощное наложение', 'Сияющий свет зари', 'Корона света']
      }
    ],
    'Волшебник': [
      { 
        name: 'Школа Воплощения', 
        description: 'Вы фокусируетесь на магии, которая создаёт мощные элементальные эффекты, такие как холодный мороз, жгучее пламя, подобно грому звук, едкий кислотный дождь, или сверкающая молния.',
        features: ['Школьный чародей (Воплощение)', 'Искусный Воплощатель', 'Раздельное Воплощение', 'Усиленное Воплощение', 'Заряженное Воплощение']
      },
      { 
        name: 'Школа Ограждения', 
        description: 'Школа Ограждения подчёркивает магию, которая блокирует, отгоняет или защищает. Защитники утверждают, что магия Воплощения разрушительна, но ограждающая магия истинно благородна.',
        features: ['Школьный чародей (Ограждение)', 'Бдительный страж', 'Защищённый маг', 'Защитные слова', 'Сопротивление заклинаниям']
      }
    ]
  };
  
  return archetypes[className] || [];
}

// Генерация таблицы развития класса
function generateProgressionTable(cls: any) {
  const progression = [];
  
  // Стандартный бонус мастерства по уровням
  const proficiencyBonuses = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
  
  // Генерируем данные для каждого уровня
  for (let level = 1; level <= 20; level++) {
    const row: any = {
      level,
      proficiencyBonus: proficiencyBonuses[level - 1]
    };
    
    // Здесь в реальном приложении могла бы быть более детальная информация,
    // но для примера используем заглушки
    row.features = level === 1 
      ? "Основные особенности класса" 
      : level % 4 === 0 
        ? "Увеличение характеристик" 
        : "Особенности архетипа";
    
    // Для магических классов добавляем информацию о заклинаниях
    if (cls.isMagicClass) {
      row.knownSpells = Math.min(level * 2, 25);
      
      // Упрощенное представление ячеек заклинаний
      if (level >= 17) {
        row.spellSlots = "4/3/3/3/2/1/1/1/1";
      } else if (level >= 15) {
        row.spellSlots = "4/3/3/3/2/1/1/1";
      } else if (level >= 13) {
        row.spellSlots = "4/3/3/3/2/1/1";
      } else if (level >= 11) {
        row.spellSlots = "4/3/3/3/2/1";
      } else if (level >= 9) {
        row.spellSlots = "4/3/3/3/1";
      } else if (level >= 7) {
        row.spellSlots = "4/3/3/1";
      } else if (level >= 5) {
        row.spellSlots = "4/3/2";
      } else if (level >= 3) {
        row.spellSlots = "4/2";
      } else {
        row.spellSlots = "2";
      }
    }
    
    progression.push(row);
  }
  
  return progression;
}

export default ClassDetails;
