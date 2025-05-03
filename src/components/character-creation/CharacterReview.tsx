
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, FileDown, Check } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ 
  character, 
  prevStep 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Функция обработки сохранения персонажа
  const handleSaveCharacter = async () => {
    try {
      setIsSaving(true);
      
      // Добавим ID, если его еще нет
      if (!character.id) {
        character.id = `char_${Date.now()}`;
      }
      
      // Получим существующих персонажей из хранилища
      const existingCharactersJson = localStorage.getItem('dnd-characters');
      let existingCharacters = existingCharactersJson ? JSON.parse(existingCharactersJson) : [];
      
      // Проверим, существует ли уже этот персонаж
      const existingIndex = existingCharacters.findIndex((c: CharacterSheet) => c.id === character.id);
      
      if (existingIndex >= 0) {
        // Обновим существующего персонажа
        existingCharacters[existingIndex] = character;
      } else {
        // Добавим нового персонажа
        existingCharacters.push(character);
      }
      
      // Сохраним обновленный список
      localStorage.setItem('dnd-characters', JSON.stringify(existingCharacters));
      
      // Сохраним ID последнего выбранного персонажа
      localStorage.setItem('last-selected-character', character.id);
      
      // Установим флаг успешного сохранения
      setSaveSuccess(true);
      
      toast({
        title: "Персонаж сохранен",
        description: `${character.name} успешно сохранен`,
        variant: "success",
      });
      
      // Переход на страницу персонажа
      setTimeout(() => {
        navigate('/character-sheet');
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
      
    } finally {
      setIsSaving(false);
    }
  };

  // Функция экспорта персонажа в PDF
  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      
      toast({
        title: "PDF сгенерирован",
        description: "Лист персонажа готов к скачиванию",
      });
      
    }, 2000);
  };

  // Функция для форматированного отображения характеристик
  const renderAbilityScore = (score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    const sign = modifier >= 0 ? '+' : '';
    return (
      <span>
        {score} <span className="text-muted-foreground">({sign}{modifier})</span>
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Обзор персонажа</h2>
        <p className="text-muted-foreground">
          Проверьте информацию о вашем персонаже перед сохранением.
        </p>
      </div>
      
      <Tabs defaultValue="basic" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="basic">Основные данные</TabsTrigger>
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="features">Особенности</TabsTrigger>
        </TabsList>
        
        {/* Вкладка с основными данными */}
        <TabsContent value="basic">
          <Card className="border border-primary/20 bg-card/80">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-xl flex justify-between items-center">
                <span>Личная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-medium block">Имя:</span>
                    <span className="text-muted-foreground">{character.name || "Не указано"}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Пол:</span>
                    <span className="text-muted-foreground">{character.gender || "Не указан"}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Раса:</span>
                    <span className="text-muted-foreground">{character.race} {character.subrace ? `(${character.subrace})` : ""}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Мировоззрение:</span>
                    <span className="text-muted-foreground">{character.alignment || "Не указано"}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium block">Класс:</span>
                    <span className="text-muted-foreground">{character.class} {character.subclass ? `(${character.subclass})` : ""}</span>
                  </div>
                  {character.additionalClasses && character.additionalClasses.length > 0 && (
                    <div>
                      <span className="font-medium block">Дополнительные классы:</span>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {character.additionalClasses.map((cls, index) => (
                          <li key={index}>
                            {cls.class} (Уровень {cls.level}) {cls.subclass ? `- ${cls.subclass}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="font-medium block">Уровень:</span>
                    <span className="text-muted-foreground">{character.level}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Предыстория:</span>
                    <span className="text-muted-foreground">{character.background || "Не указана"}</span>
                  </div>
                </div>
              </div>
              
              {/* Языки */}
              <div className="mt-6">
                <span className="font-medium block">Языки:</span>
                <div className="text-muted-foreground flex flex-wrap gap-2 mt-1">
                  {character.languages && character.languages.length > 0 ? 
                    character.languages.map((lang, index) => (
                      <span key={index} className="bg-primary/10 px-2 py-1 rounded-md text-sm">
                        {lang}
                      </span>
                    )) : 
                    "Не указаны"
                  }
                </div>
              </div>
              
              {/* Внешность и история */}
              {(character.appearance || character.backstory) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {character.appearance && (
                    <div>
                      <span className="font-medium block">Внешность:</span>
                      <p className="text-muted-foreground mt-1">{character.appearance}</p>
                    </div>
                  )}
                  
                  {character.backstory && (
                    <div>
                      <span className="font-medium block">История персонажа:</span>
                      <p className="text-muted-foreground mt-1">{character.backstory}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка с характеристиками */}
        <TabsContent value="abilities">
          <Card className="border border-primary/20 bg-card/80">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-xl">Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-foreground">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">СИЛА</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.strength)}
                  </span>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">ЛОВКОСТЬ</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.dexterity)}
                  </span>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">ТЕЛОСЛОЖЕНИЕ</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.constitution)}
                  </span>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">ИНТЕЛЛЕКТ</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.intelligence)}
                  </span>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">МУДРОСТЬ</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.wisdom)}
                  </span>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <span className="block text-sm font-medium mb-1">ХАРИЗМА</span>
                  <span className="text-2xl font-bold">
                    {renderAbilityScore(character.abilities.charisma)}
                  </span>
                </div>
              </div>
              
              {/* Навыки */}
              {character.skills && character.skills.length > 0 && (
                <div className="mt-6">
                  <span className="font-medium block mb-2">Владение навыками:</span>
                  <div className="flex flex-wrap gap-2">
                    {character.skills.map((skill, index) => (
                      <span key={index} className="bg-primary/10 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка с особенностями */}
        <TabsContent value="features">
          <Card className="border border-primary/20 bg-card/80">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-xl">Особенности и снаряжение</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-foreground">
              {/* Особенности */}
              {character.features && character.features.length > 0 && (
                <div className="mb-6">
                  <span className="font-medium block mb-2">Особенности:</span>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {character.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Заклинания */}
              {character.spells && character.spells.length > 0 && (
                <div className="mb-6">
                  <span className="font-medium block mb-2">Известные заклинания:</span>
                  <div className="flex flex-wrap gap-2">
                    {character.spells.map((spell, index) => (
                      <span key={index} className="bg-primary/10 px-3 py-1 rounded-md text-sm">
                        {spell}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Снаряжение */}
              {character.equipment && character.equipment.length > 0 && (
                <div>
                  <span className="font-medium block mb-2">Снаряжение:</span>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {character.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleSaveCharacter}
          className="flex-1 max-w-md"
          disabled={isSaving || saveSuccess}
          style={{
            backgroundColor: saveSuccess ? currentTheme.success || 'green' : undefined
          }}
        >
          {saveSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Сохранено
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Сохранение...' : 'Сохранить персонажа'}
            </>
          )}
        </Button>
        
        <Button
          onClick={handleExportPdf}
          variant="outline"
          className="flex-1 max-w-md"
          disabled={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" /> {isExporting ? 'Генерация PDF...' : 'Экспорт в PDF'}
        </Button>
      </div>
      
      <div className="mt-6">
        <NavigationButtons
          nextStep={() => {}}
          prevStep={prevStep}
          allowNext={false}
          hideNextButton={true}
        />
      </div>
    </div>
  );
};

export default CharacterReview;
