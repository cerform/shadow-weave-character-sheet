
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface BackgroundDetailsProps {
  background: any;
  onBack: () => void;
}

const BackgroundDetails: React.FC<BackgroundDetailsProps> = ({ background, onBack }) => {
  const [activeTab, setActiveTab] = useState("features");
  
  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  if (!background) return null;

  return (
    <div className="space-y-6" style={{ color: currentTheme.textColor }}>
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center"
          style={{ 
            borderColor: `${currentTheme.accent}50`,
            color: currentTheme.textColor 
          }}
        >
          <ArrowLeft size={16} className="mr-1" />
          Назад
        </Button>
        <h2 
          className="text-2xl font-bold ml-4"
          style={{ color: currentTheme.textColor }}
        >
          {background.name}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto flex items-center"
          style={{ 
            borderColor: `${currentTheme.accent}50`,
            color: currentTheme.textColor 
          }}
        >
          <Download size={16} className="mr-1" />
          Экспорт в PDF
        </Button>
      </div>
      
      <p className="text-gray-700" style={{ color: currentTheme.textColor }}>{background.description}</p>
      
      <Tabs 
        defaultValue="features" 
        onValueChange={setActiveTab} 
        value={activeTab}
        className="w-full"
      >
        <TabsList 
          className="mb-4 w-full justify-start"
          style={{ 
            backgroundColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor 
          }}
        >
          <TabsTrigger 
            value="features"
            style={{ 
              color: activeTab === "features" ? currentTheme.buttonText : currentTheme.textColor,
              backgroundColor: activeTab === "features" ? currentTheme.accent : 'transparent',
              boxShadow: activeTab === "features" ? `0 0 5px ${currentTheme.accent}` : 'none'
            }}
          >
            Особенности
          </TabsTrigger>
          <TabsTrigger 
            value="proficiencies"
            style={{ 
              color: activeTab === "proficiencies" ? currentTheme.buttonText : currentTheme.textColor,
              backgroundColor: activeTab === "proficiencies" ? currentTheme.accent : 'transparent',
              boxShadow: activeTab === "proficiencies" ? `0 0 5px ${currentTheme.accent}` : 'none'
            }}
          >
            Владения
          </TabsTrigger>
          <TabsTrigger 
            value="traits"
            style={{ 
              color: activeTab === "traits" ? currentTheme.buttonText : currentTheme.textColor,
              backgroundColor: activeTab === "traits" ? currentTheme.accent : 'transparent',
              boxShadow: activeTab === "traits" ? `0 0 5px ${currentTheme.accent}` : 'none'
            }}
          >
            Черты характера
          </TabsTrigger>
          <TabsTrigger 
            value="roleplay"
            style={{ 
              color: activeTab === "roleplay" ? currentTheme.buttonText : currentTheme.textColor,
              backgroundColor: activeTab === "roleplay" ? currentTheme.accent : 'transparent',
              boxShadow: activeTab === "roleplay" ? `0 0 5px ${currentTheme.accent}` : 'none'
            }}
          >
            Отыгрыш
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <Card style={{ 
            background: currentTheme.cardBackground,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor 
          }}>
            <CardHeader>
              <CardTitle>Особенность: {background.feature?.name || "Особая способность"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{background.feature?.description || "Описание отсутствует."}</p>
            </CardContent>
          </Card>
          
          <Card style={{ 
            background: currentTheme.cardBackground,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor 
          }}>
            <CardHeader>
              <CardTitle>Снаряжение</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{background.proficiencies?.equipment || "Особое снаряжение не указано."}</p>
            </CardContent>
          </Card>
          
          <Card style={{ 
            background: currentTheme.cardBackground,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor 
          }}>
            <CardHeader>
              <CardTitle>Варианты предыстории</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Вы можете настроить свою предысторию вместе с вашим Мастером, чтобы она лучше соответствовала вашему персонажу и кампании. Это позволит создать более уникального персонажа, который лучше вписывается в мир вашей игры.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="proficiencies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Навыки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {background.proficiencies?.skills?.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-block rounded px-3 py-1"
                      style={{ 
                        backgroundColor: `${currentTheme.accent}30`,
                        color: currentTheme.textColor 
                      }}
                    >
                      {skill}
                    </span>
                  )) || "Нет дополнительных навыков."}
                </div>
              </CardContent>
            </Card>
            
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Инструменты</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{background.proficiencies?.tools || "Нет владения инструментами."}</p>
              </CardContent>
            </Card>
            
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Языки</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{background.proficiencies?.languages || "Нет дополнительных языков."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="traits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Черты характера</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {background.personalityTraits?.map((trait: string, index: number) => (
                    <li key={index}>{trait}</li>
                  )) || <li>Нет предложенных черт характера.</li>}
                </ul>
              </CardContent>
            </Card>
            
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Идеалы</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {background.ideals?.map((ideal: string, index: number) => (
                    <li key={index}>{ideal}</li>
                  )) || <li>Нет предложенных идеалов.</li>}
                </ul>
              </CardContent>
            </Card>
            
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Привязанности</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {background.bonds?.map((bond: string, index: number) => (
                    <li key={index}>{bond}</li>
                  )) || <li>Нет предложенных привязанностей.</li>}
                </ul>
              </CardContent>
            </Card>
            
            <Card style={{ 
              background: currentTheme.cardBackground,
              borderColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor 
            }}>
              <CardHeader>
                <CardTitle>Слабости</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {background.flaws?.map((flaw: string, index: number) => (
                    <li key={index}>{flaw}</li>
                  )) || <li>Нет предложенных слабостей.</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="roleplay">
          <Card style={{ 
            background: currentTheme.cardBackground,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor 
          }}>
            <CardHeader>
              <CardTitle>Советы по отыгрышу</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Вот несколько идей, как отыгрывать персонажа с предысторией "{background.name}":</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Подумайте, как ваша предыстория влияет на отношение вашего персонажа к другим людям и ситуациям.</li>
                <li>Используйте особенности вашей предыстории, чтобы создать интересные связи с миром и другими персонажами.</li>
                <li>Не бойтесь интегрировать ваши черты характера, идеалы, привязанности и слабости в игровой процесс.</li>
                <li>Обсудите с Мастером, как ваша предыстория может быть связана с сюжетом кампании.</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Примеры классов, хорошо сочетающихся с этой предысторией</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {getRecommendedClasses(background.name).map((className, index) => (
                  <div 
                    key={index} 
                    className="p-2 rounded border"
                    style={{ 
                      backgroundColor: `${currentTheme.accent}20`,
                      borderColor: `${currentTheme.accent}40`,
                      color: currentTheme.textColor 
                    }}
                  >
                    {className}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Получение рекомендуемых классов для предыстории
function getRecommendedClasses(backgroundName: string) {
  const recommendations: { [key: string]: string[] } = {
    'Артист': ['Бард', 'Плут', 'Колдун'],
    'Беспризорник': ['Плут', 'Монах', 'Следопыт'],
    'Благородный': ['Паладин', 'Воин', 'Волшебник']
  };
  
  return recommendations[backgroundName] || ['Любой класс'];
}

export default BackgroundDetails;
