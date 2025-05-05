
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';

interface RaceDetailsProps {
  race: any;
  onBack: () => void;
}

const RaceDetails: React.FC<RaceDetailsProps> = ({ race, onBack }) => {
  const [activeTab, setActiveTab] = useState("traits");
  
  if (!race) return null;

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
        <h2 className="text-2xl font-bold ml-4">{race.name}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto flex items-center"
        >
          <Download size={16} className="mr-1" />
          Экспорт в PDF
        </Button>
      </div>
      
      <p className="text-gray-700">{race.description}</p>
      
      <Tabs defaultValue="traits" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="traits">Особенности</TabsTrigger>
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="subraces">Разновидности</TabsTrigger>
          <TabsTrigger value="builds">Рекомендации</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traits" className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Расовые черты</h3>
            <Accordion type="multiple" className="w-full">
              {race.traits.map((trait: string, index: number) => (
                <AccordionItem key={index} value={`trait-${index}`}>
                  <AccordionTrigger>{trait.split(':')[0] || trait}</AccordionTrigger>
                  <AccordionContent>
                    {trait.includes(':') ? trait.split(':')[1].trim() : 
                    "Подробное описание этой особенности вы можете найти в Книге игрока."}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Размер</h3>
              <p>{race.size}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Скорость</h3>
              <p>{race.speed} фт.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Языки</h3>
              <p>{race.languages.join(', ')}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Зрение</h3>
              <p>{race.vision || "Обычное"}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="abilities">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Прирост характеристик</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {race.abilityScoreIncrease && Object.entries(race.abilityScoreIncrease).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <span>
                    {key === 'strength' && 'Сила'}
                    {key === 'dexterity' && 'Ловкость'}
                    {key === 'constitution' && 'Телосложение'}
                    {key === 'intelligence' && 'Интеллект'}
                    {key === 'wisdom' && 'Мудрость'}
                    {key === 'charisma' && 'Харизма'}
                    {key === 'all' && 'Все характеристики'}
                  </span>
                  <span className="font-semibold">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="subraces">
          {race.subraces && race.subraces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {race.subraces.map((subrace: any, index: number) => {
                // Проверяем, является ли subrace объектом или строкой
                const subraceObj = typeof subrace === 'string' 
                  ? { name: subrace, description: `Разновидность ${subrace} расы ${race.name}` }
                  : subrace;
                  
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{subraceObj.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Properly handle different types with explicit rendering */}
                      {(() => {
                        // Use an IIFE to ensure we return a ReactNode
                        if (typeof subraceObj.description === 'object') {
                          return <p>Подробное описание</p>;
                        } else if (typeof subraceObj.description === 'string') {
                          return <p>{subraceObj.description}</p>;
                        } else {
                          return <p>Нет описания</p>;
                        }
                      })()}
                      
                      {subraceObj.traits && (
                        <div className="mt-3">
                          <h4 className="font-semibold mb-1">Дополнительные черты:</h4>
                          <ul className="list-disc pl-5">
                            {subraceObj.traits.map((trait: string, idx: number) => (
                              <li key={idx}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subraceObj.abilityScoreIncrease && (
                        <div className="mt-3">
                          <h4 className="font-semibold mb-1">Дополнительный прирост характеристик:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(subraceObj.abilityScoreIncrease).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-1 border rounded">
                                <span>
                                  {key === 'strength' && 'Сила'}
                                  {key === 'dexterity' && 'Ловкость'}
                                  {key === 'constitution' && 'Телосложение'}
                                  {key === 'intelligence' && 'Интеллект'}
                                  {key === 'wisdom' && 'Мудрость'}
                                  {key === 'charisma' && 'Харизма'}
                                </span>
                                <span className="font-semibold">+{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <p>У этой расы нет подрас.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="builds">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Рекомендуемые комбинации с классами</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedBuilds(race.name).map((build: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{build.class}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{build.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Получение рекомендуемых билдов для расы
function getRecommendedBuilds(raceName: string) {
  const builds: { [key: string]: Array<{ class: string; description: string }> } = {
    'Человек': [
      { class: 'Воин', description: 'Универсальный боец с высокой универсальностью, способный адаптироваться к любому стилю игры.' },
      { class: 'Паладин', description: 'Харизматичный защитник с божественными способностями и сильными боевыми навыками.' },
      { class: 'Бард', description: 'Мастер всех ремесел, использующий свою универсальность для поддержки команды и вдохновения.' }
    ],
    'Эльф': [
      { class: 'Волшебник', description: 'Высокие эльфы с бонусом к интеллекту идеально подходят для изучения сложных заклинаний.' },
      { class: 'Следопыт', description: 'Лесные эльфы с бонусом к мудрости отлично подходят для отслеживания добычи и выживания в дикой местности.' },
      { class: 'Плут', description: 'Природная ловкость эльфов дает преимущество в скрытности и точных атаках.' }
    ],
    'Дварф': [
      { class: 'Воин', description: 'Горные дварфы с бонусом к силе и выносливости становятся непробиваемыми защитниками.' },
      { class: 'Жрец', description: 'Холмовые дварфы с бонусом к мудрости отлично подходят для роли духовных лидеров.' },
      { class: 'Паладин', description: 'Сочетание выносливости дварфов и святой мощи паладина создает мощного защитника.' }
    ]
  };
  
  return builds[raceName] || [
    { class: 'Любой', description: 'Эта раса универсальна и может хорошо сочетаться с разными классами в зависимости от вашего стиля игры.' }
  ];
}

export default RaceDetails;
