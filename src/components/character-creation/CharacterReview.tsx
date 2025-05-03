
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { CharacterSheet } from "@/types/character";

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  prevStep,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleExportPDF = async () => {
    setPdfGenerating(true);
    try {
      toast({
        title: "Экспорт персонажа",
        description: "Пожалуйста, подождите. Персонаж экспортируется в PDF...",
      });
      
      // Здесь будет логика генерации PDF
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
      
      toast({
        title: "Успешно",
        description: "Персонаж успешно экспортирован в PDF.",
      });
    } catch (error) {
      console.error("Ошибка экспорта персонажа:", error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать персонажа в PDF.",
        variant: "destructive",
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSaveCharacter = async () => {
    try {
      toast({
        title: "Сохранение персонажа",
        description: "Пожалуйста, подождите. Персонаж сохраняется...",
      });
      
      // Здесь будет логика сохранения персонажа
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
      
      toast({
        title: "Успешно",
        description: "Персонаж успешно сохранен.",
      });
    } catch (error) {
      console.error("Ошибка сохранения персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа.",
        variant: "destructive",
      });
    }
  };

  // Функции для удобного вывода информации
  const getAbilityScore = (ability: string): string => {
    const score = character.abilities[ability as keyof typeof character.abilities];
    const modifier = Math.floor((score - 10) / 2);
    return `${score} (${modifier >= 0 ? '+' : ''}${modifier})`;
  };
  
  // Вычисляем общий уровень персонажа (основной + мультикласс)
  const getTotalLevel = (): number => {
    let totalLevel = character.level;
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        totalLevel += cls.level;
      });
    }
    
    return totalLevel;
  };
  
  // Полное описание классов персонажа с уровнями
  const getCharacterClassDescription = (): string => {
    let description = `${character.class} ${character.level}`;
    
    if (character.subclass) {
      description += ` (${character.subclass})`;
    }
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        description += ` / ${cls.class} ${cls.level}`;
      });
    }
    
    return description;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Обзор персонажа</h2>
      
      <div className="mb-6">
        <div className="bg-muted p-6 rounded-lg">
          <div className="text-3xl font-bold mb-2">{character.name || "Безымянный герой"}</div>
          <div className="text-xl text-muted-foreground">
            {character.race} {getCharacterClassDescription()}, {character.background || "Без предыстории"}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="basic">Основная информация</TabsTrigger>
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="features">Особенности и навыки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Личная информация</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Имя:</span>
                      <span>{character.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Пол:</span>
                      <span>{character.gender || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Раса:</span>
                      <span>{character.race || "—"}</span>
                    </div>
                    {character.subrace && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Разновидность:</span>
                        <span>{character.subrace}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Игровая информация</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Основной класс:</span>
                      <span>{character.class || "—"}</span>
                    </div>
                    {character.subclass && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Подкласс:</span>
                        <span>{character.subclass}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Уровень:</span>
                      <span>{character.level || "1"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Предыстория:</span>
                      <span>{character.background || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Мировоззрение:</span>
                      <span>{character.alignment || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Мультиклассирование */}
              {character.additionalClasses && character.additionalClasses.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Мультиклассирование</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Общий уровень:</span>
                      <span>{getTotalLevel()}</span>
                    </div>
                    
                    {character.additionalClasses.map((cls, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{cls.class}:</span>
                        <span>Уровень {cls.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Описание персонажа</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Внешность</h4>
                  <p className="text-muted-foreground">{character.appearance || "Описание внешности отсутствует."}</p>
                </div>
                <div>
                  <h4 className="font-medium">Предыстория</h4>
                  <p className="text-muted-foreground">{character.backstory || "История персонажа отсутствует."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="abilities" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Основные характеристики</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Сила</div>
                  <div className="text-2xl font-bold">{getAbilityScore('strength')}</div>
                </div>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Ловкость</div>
                  <div className="text-2xl font-bold">{getAbilityScore('dexterity')}</div>
                </div>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Телосложение</div>
                  <div className="text-2xl font-bold">{getAbilityScore('constitution')}</div>
                </div>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Интеллект</div>
                  <div className="text-2xl font-bold">{getAbilityScore('intelligence')}</div>
                </div>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Мудрость</div>
                  <div className="text-2xl font-bold">{getAbilityScore('wisdom')}</div>
                </div>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted-foreground">Харизма</div>
                  <div className="text-2xl font-bold">{getAbilityScore('charisma')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Пассивные характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <div className="text-muted-foreground">Пассивная Внимательность</div>
                  <div className="text-xl font-bold">
                    {10 + Math.floor((character.abilities.wisdom - 10) / 2)}
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-muted-foreground">Бонус мастерства</div>
                  <div className="text-xl font-bold">
                    +{Math.floor((getTotalLevel() - 1) / 4) + 2}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Владения и языки</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Владения</h4>
                  <p className="text-muted-foreground">
                    {character.proficiencies && character.proficiencies.length > 0 
                      ? character.proficiencies.join(", ") 
                      : "Нет владений"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Языки</h4>
                  <p className="text-muted-foreground">
                    {character.languages && character.languages.length > 0 
                      ? character.languages.join(", ") 
                      : "Языки не выбраны"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Особенности</h3>
              <div className="space-y-2">
                {character.features && character.features.length > 0 ? (
                  character.features.map((feature, index) => (
                    <div key={index} className="border-b pb-2">
                      <p>{feature}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Нет особенностей</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {character.spells && character.spells.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Заклинания</h3>
                <div className="space-y-2">
                  {character.spells.map((spell, index) => (
                    <div key={index} className="border-b pb-2">
                      <p>{spell}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
        <Button onClick={handleExportPDF} disabled={pdfGenerating}>
          Экспорт в PDF
        </Button>
        <Button 
          onClick={handleSaveCharacter}
          variant="default"
        >
          Сохранить персонажа
        </Button>
      </div>
      
      <div className="mt-6">
        <NavigationButtons 
          allowNext={false}
          nextStep={() => {}}
          prevStep={prevStep}
          isFirstStep={false}
          hideNextButton={true}
        />
      </div>
    </div>
  );
};

export default CharacterReview;
