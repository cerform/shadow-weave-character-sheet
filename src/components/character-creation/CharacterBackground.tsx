
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backgrounds } from "@/data/backgrounds";
import { alignments } from "@/data/alignments";
import { CharacterSheet } from '@/types/character';

interface CharacterBackgroundProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string>(character.background || "");
  const [selectedAlignment, setSelectedAlignment] = useState<string>(character.alignment || "");
  const [backstory, setBackstory] = useState<string>(character.backstory || "");
  const [personalityTraits, setPersonalityTraits] = useState<string>(character.personalityTraits || "");
  const [ideals, setIdeals] = useState<string>(character.ideals || "");
  const [bonds, setBonds] = useState<string>(character.bonds || "");
  const [flaws, setFlaws] = useState<string>(character.flaws || "");
  
  // Получение информации о выбранном бэкграунде
  const backgroundInfo = backgrounds.find(b => b.id === selectedBackground);
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    // Преобразовываем профиценции для совместимости
    let proficiencies = character.proficiencies;
    
    if (backgroundInfo) {
      // Если полученные данные являются массивом, преобразуем их в объект
      if (Array.isArray(proficiencies)) {
        proficiencies = {
          armor: [],
          weapons: [],
          tools: [...backgroundInfo.proficiencies.tools],
          languages: []
        };
      } else {
        // Иначе добавляем в существующий объект
        proficiencies = {
          ...(proficiencies || {}),
          tools: [...(proficiencies?.tools || []), ...backgroundInfo.proficiencies.tools]
        };
      }
    }
    
    updateCharacter({
      background: backgroundInfo?.name || selectedBackground,
      alignment: selectedAlignment,
      backstory,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      proficiencies
    });
    
    nextStep();
  };
  
  // Рендер предложений для характеристик персонажа на основе бэкграунда
  const renderSuggestions = (type: "personalityTraits" | "ideals" | "bonds" | "flaws") => {
    if (!backgroundInfo || !backgroundInfo.suggestedCharacteristics[type]?.length) {
      return <p className="text-muted-foreground">Нет предложений для этого бэкграунда</p>;
    }
    
    return (
      <div className="grid gap-2">
        {backgroundInfo.suggestedCharacteristics[type].map((item, index) => (
          <Button 
            key={index} 
            variant="ghost" 
            className="justify-start text-left h-auto py-1"
            onClick={() => {
              switch(type) {
                case "personalityTraits":
                  setPersonalityTraits(prev => prev ? `${prev}\n${item}` : item);
                  break;
                case "ideals":
                  setIdeals(prev => prev ? `${prev}\n${item}` : item);
                  break;
                case "bonds":
                  setBonds(prev => prev ? `${prev}\n${item}` : item);
                  break;
                case "flaws":
                  setFlaws(prev => prev ? `${prev}\n${item}` : item);
                  break;
              }
            }}
          >
            {item}
          </Button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Предыстория и характеристики</h1>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="background-select" className="block mb-2">Предыстория</Label>
            <Select
              value={selectedBackground}
              onValueChange={setSelectedBackground}
            >
              <SelectTrigger id="background-select">
                <SelectValue placeholder="Выберите предысторию" />
              </SelectTrigger>
              <SelectContent>
                {backgrounds.map((bg) => (
                  <SelectItem key={bg.id} value={bg.id}>{bg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="alignment-select" className="block mb-2">Мировоззрение</Label>
            <Select
              value={selectedAlignment}
              onValueChange={setSelectedAlignment}
            >
              <SelectTrigger id="alignment-select">
                <SelectValue placeholder="Выберите мировоззрение" />
              </SelectTrigger>
              <SelectContent>
                {alignments.map((align) => (
                  <SelectItem key={align.id} value={align.id}>{align.name} ({align.shortDesc})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {backgroundInfo && (
          <div className="bg-primary-foreground/10 p-4 rounded-md mb-6">
            <h3 className="font-bold mb-2">{backgroundInfo.name}</h3>
            <p className="text-sm mb-4">{backgroundInfo.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Умения:</h4>
              <ul className="list-disc list-inside text-sm">
                {backgroundInfo.proficiencies.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
              
              {backgroundInfo.proficiencies.tools.length > 0 && (
                <>
                  <h4 className="font-semibold">Инструменты:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {backgroundInfo.proficiencies.tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </>
              )}
              
              <h4 className="font-semibold">Особенность:</h4>
              <p className="text-sm"><strong>{backgroundInfo.feature.name}:</strong> {backgroundInfo.feature.description}</p>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <Label htmlFor="backstory" className="block mb-2">История персонажа</Label>
          <Textarea
            id="backstory"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="Опишите историю вашего персонажа..."
            className="min-h-[150px]"
          />
        </div>
        
        <Tabs defaultValue="traits" className="mb-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="traits">Черты</TabsTrigger>
            <TabsTrigger value="ideals">Идеалы</TabsTrigger>
            <TabsTrigger value="bonds">Привязанности</TabsTrigger>
            <TabsTrigger value="flaws">Слабости</TabsTrigger>
          </TabsList>
          
          <TabsContent value="traits" className="space-y-4">
            <div>
              <Label htmlFor="traits" className="block mb-2">Черты характера</Label>
              <Textarea
                id="traits"
                value={personalityTraits}
                onChange={(e) => setPersonalityTraits(e.target.value)}
                placeholder="Опишите черты характера вашего персонажа..."
              />
            </div>
            
            {backgroundInfo && (
              <div>
                <Label className="block mb-2">Предложения для черт характера</Label>
                {renderSuggestions("personalityTraits")}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ideals" className="space-y-4">
            <div>
              <Label htmlFor="ideals" className="block mb-2">Идеалы</Label>
              <Textarea
                id="ideals"
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                placeholder="Опишите идеалы вашего персонажа..."
              />
            </div>
            
            {backgroundInfo && (
              <div>
                <Label className="block mb-2">Предложения для идеалов</Label>
                {renderSuggestions("ideals")}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bonds" className="space-y-4">
            <div>
              <Label htmlFor="bonds" className="block mb-2">Привязанности</Label>
              <Textarea
                id="bonds"
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                placeholder="Опишите привязанности вашего персонажа..."
              />
            </div>
            
            {backgroundInfo && (
              <div>
                <Label className="block mb-2">Предложения для привязанностей</Label>
                {renderSuggestions("bonds")}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flaws" className="space-y-4">
            <div>
              <Label htmlFor="flaws" className="block mb-2">Слабости</Label>
              <Textarea
                id="flaws"
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                placeholder="Опишите слабости вашего персонажа..."
              />
            </div>
            
            {backgroundInfo && (
              <div>
                <Label className="block mb-2">Предложения для слабостей</Label>
                {renderSuggestions("flaws")}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
          >
            Назад
          </Button>
          <Button
            onClick={handleNextStep}
          >
            Далее
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterBackground;
