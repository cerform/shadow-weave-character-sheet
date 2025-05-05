
import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';

interface BackgroundDetailsProps {
  background: any;
  onBack: () => void;
}

const BackgroundDetails: React.FC<BackgroundDetailsProps> = ({ background, onBack }) => {
  const [activeTab, setActiveTab] = useState("features");
  
  if (!background) return null;

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
        <h2 className="text-2xl font-bold ml-4">{background.name}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto flex items-center"
        >
          <Download size={16} className="mr-1" />
          Экспорт в PDF
        </Button>
      </div>
      
      <p className="text-gray-700">{background.description}</p>
      
      <Tabs defaultValue="features" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="features">Особенности</TabsTrigger>
          <TabsTrigger value="proficiencies">Владения</TabsTrigger>
          <TabsTrigger value="traits">Черты характера</TabsTrigger>
          <TabsTrigger value="roleplay">Отыгрыш</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Особенность: {background.feature?.name || "Особая способность"}</h3>
            <p>{background.feature?.description || "Описание отсутствует."}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Снаряжение</h3>
            <p>{background.proficiencies?.equipment || "Особое снаряжение не указано."}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Варианты предыстории</h3>
            <p>Вы можете настроить свою предысторию вместе с вашим Мастером, чтобы она лучше соответствовала вашему персонажу и кампании. Это позволит создать более уникального персонажа, который лучше вписывается в мир вашей игры.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="proficiencies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Навыки</h3>
              <div className="flex flex-wrap gap-2">
                {background.proficiencies?.skills?.map((skill: string, index: number) => (
                  <span key={index} className="inline-block bg-gray-200 rounded px-3 py-1">{skill}</span>
                )) || "Нет дополнительных навыков."}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Инструменты</h3>
              <p>{background.proficiencies?.tools || "Нет владения инструментами."}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Языки</h3>
              <p>{background.proficiencies?.languages || "Нет дополнительных языков."}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="traits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
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
            
            <Card>
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
            
            <Card>
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
            
            <Card>
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Советы по отыгрышу</h3>
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
                <div key={index} className="bg-white p-2 rounded border">
                  {className}
                </div>
              ))}
            </div>
          </div>
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
