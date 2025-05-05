
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronRight, ChevronLeft, Home, Book } from 'lucide-react';

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
          size="icon" 
          onClick={onBack}
          className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
        >
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-2xl font-bold ml-4 text-white">{race.name}</h2>
        <div className="ml-auto flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
          >
            <Home size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
          >
            <Book size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
          >
            <Download size={16} />
          </Button>
        </div>
      </div>
      
      <p className="text-gray-300">{race.description}</p>
      
      <Tabs defaultValue="traits" onValueChange={setActiveTab} value={activeTab} className="text-white">
        <TabsList className="mb-4 bg-gray-800 border border-purple-700/30">
          <TabsTrigger value="traits" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white">Особенности</TabsTrigger>
          <TabsTrigger value="abilities" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white">Характеристики</TabsTrigger>
          <TabsTrigger value="subraces" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white">Разновидности</TabsTrigger>
          <TabsTrigger value="builds" className="data-[state=active]:bg-purple-800 data-[state=active]:text-white">Рекомендации</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traits" className="space-y-4">
          <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Расовые черты</h3>
            <Accordion type="multiple" className="w-full">
              {race.traits.map((trait: string, index: number) => (
                <AccordionItem key={index} value={`trait-${index}`} className="border-purple-700/30">
                  <AccordionTrigger className="text-white hover:text-purple-300">{trait.split(':')[0] || trait}</AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {trait.includes(':') ? trait.split(':')[1].trim() : 
                    "Подробное описание этой особенности вы можете найти в Книге игрока."}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Размер</h3>
              <p className="text-gray-300">{race.size}</p>
            </div>
            
            <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Скорость</h3>
              <p className="text-gray-300">{race.speed} фт.</p>
            </div>
            
            <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Языки</h3>
              <p className="text-gray-300">{race.languages.join(', ')}</p>
            </div>
            
            <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Зрение</h3>
              <p className="text-gray-300">{race.vision || "Обычное"}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="abilities">
          <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Прирост характеристик</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {race.abilityScoreIncrease && Object.entries(race.abilityScoreIncrease).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded border-purple-700/30 bg-gray-800">
                  <span className="text-gray-300">
                    {key === 'strength' && 'Сила'}
                    {key === 'dexterity' && 'Ловкость'}
                    {key === 'constitution' && 'Телосложение'}
                    {key === 'intelligence' && 'Интеллект'}
                    {key === 'wisdom' && 'Мудрость'}
                    {key === 'charisma' && 'Харизма'}
                    {key === 'all' && 'Все характеристики'}
                  </span>
                  <span className="font-semibold text-purple-300">+{value}</span>
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
                  <Card key={index} className="overflow-hidden border border-purple-700/20 bg-gray-900/80 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle>{subraceObj.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Правильно отображаем описание в зависимости от типа */}
                      {(() => {
                        if (typeof subraceObj.description === 'object') {
                          return <p className="text-gray-300">Подробное описание</p>;
                        } else if (typeof subraceObj.description === 'string') {
                          return <p className="text-gray-300">{subraceObj.description}</p>;
                        } else {
                          return <p className="text-gray-300">Нет описания</p>;
                        }
                      })()}
                      
                      {subraceObj.traits && (
                        <div className="mt-3">
                          <h4 className="font-semibold mb-1 text-purple-300">Дополнительные черты:</h4>
                          <ul className="list-disc pl-5 text-gray-300">
                            {subraceObj.traits.map((trait: string, idx: number) => (
                              <li key={idx}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subraceObj.abilityScoreIncrease && (
                        <div className="mt-3">
                          <h4 className="font-semibold mb-1 text-purple-300">Дополнительный прирост характеристик:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(subraceObj.abilityScoreIncrease).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-1 border rounded border-purple-700/30 bg-gray-800">
                                <span className="text-gray-300">
                                  {key === 'strength' && 'Сила'}
                                  {key === 'dexterity' && 'Ловкость'}
                                  {key === 'constitution' && 'Телосложение'}
                                  {key === 'intelligence' && 'Интеллект'}
                                  {key === 'wisdom' && 'Мудрость'}
                                  {key === 'charisma' && 'Харизма'}
                                </span>
                                <span className="font-semibold text-purple-300">+{value}</span>
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
            <div className="text-center p-8 text-gray-300 bg-gray-900/50 rounded-lg border border-purple-700/20">
              <p>У этой расы нет подрас.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="builds">
          <div className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20">
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Рекомендуемые комбинации с классами</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedBuilds(race.name).map((build: any, index: number) => (
                <Card key={index} className="border border-purple-700/20 bg-gray-900/80 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{build.class}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">{build.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
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
