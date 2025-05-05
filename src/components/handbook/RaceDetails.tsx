
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronRight, ChevronLeft, Home, Book, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeSelector from '@/components/ThemeSelector';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface RaceDetailsProps {
  race: any;
  onBack: () => void;
}

// Define more specific types for subraces
interface SubraceObj {
  name: string;
  description: string | Record<string, unknown>;
  traits?: string[];
  abilityScoreIncrease?: Record<string, number>;
}

const RaceDetails: React.FC<RaceDetailsProps> = ({ race, onBack }) => {
  const [activeTab, setActiveTab] = useState("traits");
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  if (!race) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
          style={{ borderColor: `${currentTheme.accent}50` }}
        >
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-2xl font-bold ml-4" style={{ color: currentTheme.textColor }}>{race.name}</h2>
        <div className="ml-auto flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
            style={{ borderColor: `${currentTheme.accent}50` }}
            asChild
          >
            <Link to="/">
              <Home size={16} />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
            style={{ borderColor: `${currentTheme.accent}50` }}
            asChild
          >
            <Link to="/spellbook">
              <Book size={16} />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
            style={{ borderColor: `${currentTheme.accent}50` }}
            asChild
          >
            <Link to="/auth">
              <User size={16} />
            </Link>
          </Button>
          <ThemeSelector />
        </div>
      </div>
      
      <p style={{ color: currentTheme.textColor }}>{race.description}</p>
      
      <Tabs 
        defaultValue="traits" 
        onValueChange={setActiveTab} 
        value={activeTab} 
        className="text-white"
      >
        <TabsList 
          className="mb-4 bg-gray-800 border border-purple-700/30"
          style={{ 
            background: `${currentTheme.cardBackground}`, 
            borderColor: `${currentTheme.accent}30` 
          }}
        >
          <TabsTrigger 
            value="traits" 
            className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            style={{ 
              color: currentTheme.textColor,
              ['--tw-bg-opacity' as any]: 'data-[state=active]:1',
              background: `data-[state=active]:${currentTheme.accent}`
            }}
          >
            Особенности
          </TabsTrigger>
          <TabsTrigger 
            value="abilities" 
            className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            style={{ 
              color: currentTheme.textColor,
              ['--tw-bg-opacity' as any]: 'data-[state=active]:1',
              background: `data-[state=active]:${currentTheme.accent}`
            }}
          >
            Характеристики
          </TabsTrigger>
          <TabsTrigger 
            value="subraces" 
            className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            style={{ 
              color: currentTheme.textColor,
              ['--tw-bg-opacity' as any]: 'data-[state=active]:1',
              background: `data-[state=active]:${currentTheme.accent}`
            }}
          >
            Разновидности
          </TabsTrigger>
          <TabsTrigger 
            value="builds" 
            className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            style={{ 
              color: currentTheme.textColor,
              ['--tw-bg-opacity' as any]: 'data-[state=active]:1',
              background: `data-[state=active]:${currentTheme.accent}`
            }}
          >
            Рекомендации
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="traits" className="space-y-4">
          <div 
            className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
            style={{ 
              background: `${currentTheme.cardBackground}`, 
              borderColor: `${currentTheme.accent}20` 
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2 text-purple-300"
              style={{ color: currentTheme.accent }}
            >
              Расовые черты
            </h3>
            <Accordion 
              type="multiple" 
              className="w-full"
            >
              {race.traits.map((trait: string, index: number) => (
                <AccordionItem 
                  key={index} 
                  value={`trait-${index}`} 
                  className="border-purple-700/30"
                  style={{ borderColor: `${currentTheme.accent}30` }}
                >
                  <AccordionTrigger 
                    className="text-white hover:text-purple-300"
                    style={{ 
                      color: currentTheme.textColor
                    }}
                  >
                    {trait.split(':')[0] || trait}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300" style={{ color: currentTheme.textColor }}>
                    {trait.includes(':') ? trait.split(':')[1].trim() : 
                    "Подробное описание этой особенности вы можете найти в Книге игрока."}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
              style={{ 
                background: `${currentTheme.cardBackground}`, 
                borderColor: `${currentTheme.accent}20` 
              }}
            >
              <h3 
                className="text-lg font-semibold mb-2 text-purple-300"
                style={{ color: currentTheme.accent }}
              >
                Размер
              </h3>
              <p className="text-gray-300" style={{ color: currentTheme.textColor }}>{race.size}</p>
            </div>
            
            <div 
              className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
              style={{ 
                background: `${currentTheme.cardBackground}`, 
                borderColor: `${currentTheme.accent}20` 
              }}
            >
              <h3 
                className="text-lg font-semibold mb-2 text-purple-300"
                style={{ color: currentTheme.accent }}
              >
                Скорость
              </h3>
              <p className="text-gray-300" style={{ color: currentTheme.textColor }}>{race.speed} фт.</p>
            </div>
            
            <div 
              className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
              style={{ 
                background: `${currentTheme.cardBackground}`, 
                borderColor: `${currentTheme.accent}20` 
              }}
            >
              <h3 
                className="text-lg font-semibold mb-2 text-purple-300"
                style={{ color: currentTheme.accent }}
              >
                Языки
              </h3>
              <p className="text-gray-300" style={{ color: currentTheme.textColor }}>{race.languages.join(', ')}</p>
            </div>
            
            <div 
              className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
              style={{ 
                background: `${currentTheme.cardBackground}`, 
                borderColor: `${currentTheme.accent}20` 
              }}
            >
              <h3 
                className="text-lg font-semibold mb-2 text-purple-300"
                style={{ color: currentTheme.accent }}
              >
                Зрение
              </h3>
              <p className="text-gray-300" style={{ color: currentTheme.textColor }}>{race.vision || "Обычное"}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="abilities">
          <div 
            className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
            style={{ 
              background: `${currentTheme.cardBackground}`, 
              borderColor: `${currentTheme.accent}20` 
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2 text-purple-300"
              style={{ color: currentTheme.accent }}
            >
              Прирост характеристик
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {race.abilityScoreIncrease && Object.entries(race.abilityScoreIncrease).map(([key, value]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-2 border rounded border-purple-700/30 bg-gray-800"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    borderColor: `${currentTheme.accent}30` 
                  }}
                >
                  <span className="text-gray-300" style={{ color: currentTheme.textColor }}>
                    {key === 'strength' && 'Сила'}
                    {key === 'dexterity' && 'Ловкость'}
                    {key === 'constitution' && 'Телосложение'}
                    {key === 'intelligence' && 'Интеллект'}
                    {key === 'wisdom' && 'Мудрость'}
                    {key === 'charisma' && 'Харизма'}
                    {key === 'all' && 'Все характеристики'}
                  </span>
                  <span 
                    className="font-semibold text-purple-300"
                    style={{ color: currentTheme.accent }}
                  >
                    +{value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="subraces">
          {race.subraces && race.subraces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {race.subraces.map((subrace: string | SubraceObj, index: number) => {
                // Проверяем, является ли subrace объектом или строкой
                const subraceObj: SubraceObj = typeof subrace === 'string' 
                  ? { name: subrace, description: `Разновидность ${subrace} расы ${race.name}` }
                  : subrace as SubraceObj;
                  
                return (
                  <Card 
                    key={index} 
                    className="overflow-hidden border border-purple-700/20 bg-gray-900/80 text-white"
                    style={{ 
                      background: `${currentTheme.cardBackground}`, 
                      borderColor: `${currentTheme.accent}20`,
                      color: currentTheme.textColor 
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle style={{ color: currentTheme.textColor }}>{subraceObj.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Правильно отображаем описание в зависимости от типа */}
                      {(() => {
                        if (typeof subraceObj.description === 'object') {
                          return <p className="text-gray-300" style={{ color: currentTheme.textColor }}>Подробное описание</p>;
                        } else if (typeof subraceObj.description === 'string') {
                          return <p className="text-gray-300" style={{ color: currentTheme.textColor }}>{subraceObj.description}</p>;
                        } else {
                          return <p className="text-gray-300" style={{ color: currentTheme.textColor }}>Нет описания</p>;
                        }
                      })()}
                      
                      {subraceObj.traits && Array.isArray(subraceObj.traits) && (
                        <div className="mt-3">
                          <h4 
                            className="font-semibold mb-1 text-purple-300"
                            style={{ color: currentTheme.accent }}
                          >
                            Дополнительные черты:
                          </h4>
                          <ul className="list-disc pl-5 text-gray-300" style={{ color: currentTheme.textColor }}>
                            {subraceObj.traits.map((trait: string, idx: number) => (
                              <li key={idx}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subraceObj.abilityScoreIncrease && typeof subraceObj.abilityScoreIncrease === 'object' && (
                        <div className="mt-3">
                          <h4 
                            className="font-semibold mb-1 text-purple-300"
                            style={{ color: currentTheme.accent }}
                          >
                            Дополнительный прирост характеристик:
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(subraceObj.abilityScoreIncrease).map(([key, value]) => (
                              <div 
                                key={key} 
                                className="flex justify-between p-1 border rounded border-purple-700/30 bg-gray-800"
                                style={{ 
                                  background: 'rgba(0, 0, 0, 0.3)', 
                                  borderColor: `${currentTheme.accent}30` 
                                }}
                              >
                                <span className="text-gray-300" style={{ color: currentTheme.textColor }}>
                                  {key === 'strength' && 'Сила'}
                                  {key === 'dexterity' && 'Ловкость'}
                                  {key === 'constitution' && 'Телосложение'}
                                  {key === 'intelligence' && 'Интеллект'}
                                  {key === 'wisdom' && 'Мудрость'}
                                  {key === 'charisma' && 'Харизма'}
                                </span>
                                <span 
                                  className="font-semibold text-purple-300"
                                  style={{ color: currentTheme.accent }}
                                >
                                  +{value}
                                </span>
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
            <div 
              className="text-center p-8 text-gray-300 bg-gray-900/50 rounded-lg border border-purple-700/20"
              style={{ 
                background: `${currentTheme.cardBackground}40`, 
                borderColor: `${currentTheme.accent}20`,
                color: currentTheme.textColor 
              }}
            >
              <p>У этой расы нет подрас.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="builds">
          <div 
            className="bg-gray-900/80 p-4 rounded-lg border border-purple-700/20"
            style={{ 
              background: `${currentTheme.cardBackground}`, 
              borderColor: `${currentTheme.accent}20` 
            }}
          >
            <h3 
              className="text-lg font-semibold mb-2 text-purple-300"
              style={{ color: currentTheme.accent }}
            >
              Рекомендуемые комбинации с классами
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRecommendedBuilds(race.name).map((build: any, index: number) => (
                <Card 
                  key={index} 
                  className="border border-purple-700/20 bg-gray-900/80 text-white"
                  style={{ 
                    background: `${currentTheme.cardBackground}`, 
                    borderColor: `${currentTheme.accent}20`,
                    color: currentTheme.textColor 
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle 
                      className="text-lg"
                      style={{ color: currentTheme.textColor }}
                    >
                      {build.class}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p 
                      className="text-sm text-gray-300"
                      style={{ color: currentTheme.textColor }}
                    >
                      {build.description}
                    </p>
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
          style={{ 
            background: `${currentTheme.cardBackground}`, 
            borderColor: `${currentTheme.accent}50`,
            color: currentTheme.textColor 
          }}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
          style={{ 
            background: `${currentTheme.cardBackground}`, 
            borderColor: `${currentTheme.accent}50`,
            color: currentTheme.textColor 
          }}
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
