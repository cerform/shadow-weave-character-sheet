import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "./NavigationButtons";
import CharacterSkillsDisplay from "./CharacterSkillsDisplay";
import { CharacterSheet } from "@/types/character";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
// Импортируем функции из соответствующих файлов
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { saveCharacter } from "@/services/characterService";

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  prevStep,
  setCurrentStep,
  updateCharacter,
}) => {
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState(`${character.name || "character"}.json`);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [appearanceDetails, setAppearanceDetails] = useState({
    age: character.age || "",
    height: character.height || "",
    weight: character.weight || "",
    eyes: character.eyes || "",
    skin: character.skin || "",
    hair: character.hair || "",
  });

  // Функция для скачивания персонажа в формате JSON
  const downloadCharacterAsJson = () => {
    // Создаем полную копию объекта персонажа
    const characterToDownload = {
      ...character,
      // Добавляем данные о внешности
      age: appearanceDetails.age,
      height: appearanceDetails.height,
      weight: appearanceDetails.weight,
      eyes: appearanceDetails.eyes,
      skin: appearanceDetails.skin,
      hair: appearanceDetails.hair,
    };

    // Создаем Blob с данными персонажа
    const characterBlob = new Blob([JSON.stringify(characterToDownload, null, 2)], {
      type: "application/json",
    });
    
    // Создаем ссылку для скачивания файла
    const url = URL.createObjectURL(characterBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    
    // Симулируем клик по ссылке для скачивания файла
    document.body.appendChild(link);
    link.click();
    
    // Очищаем созданные объекты
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    // Закрываем диалог
    setShowDownloadDialog(false);
    
    // Показываем уведомление об успешном скачивании
    toast.success("Персонаж успешно скачан");
  };

  // Функция для генерации PDF-документа с персонажем
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Здесь должен быть код для генерации PDF
      // На данном этапе просто имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("PDF-документ успешно создан");
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      toast.error("Не удалось создать PDF-документ");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Функция для сохранения персонажа в базе данных
  const saveCharacterToDatabase = async () => {
    if (!currentUser) {
      toast.error("Необходимо войти в аккаунт для сохранения персонажа");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Обновляем character с данными о внешности
      const characterToSave = {
        ...character,
        userId: currentUser.uid,
        age: appearanceDetails.age,
        height: appearanceDetails.height,
        weight: appearanceDetails.weight,
        eyes: appearanceDetails.eyes,
        skin: appearanceDetails.skin,
        hair: appearanceDetails.hair,
      };
      
      // Сохраняем персонажа в базу данных
      await saveCharacter(characterToSave);
      
      // Выводим сообщение об успешном сохранении
      toast.success("Персонаж успешно сохранен");
      
      // Закрываем диалоговое окно
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast.error("Не удалось сохранить персонажа");
    } finally {
      setIsSaving(false);
    }
  };

  // Функция для перехода к определенному шагу создания персонажа
  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  // Проверяем, что все обязательные поля заполнены
  const isCharacterComplete = !!character.name && !!character.race && !!character.class && !!character.level;

  // Функция для отображения модификатора характеристики
  const getAbilityModifier = (abilityScore: number) => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Хелпер для безопасного получения характеристики
  const getAbilityValue = (shortName: string, fullName: string): number => {
    if (abilities) {
      // Пробуем сначала короткое имя
      if (shortName in abilities) {
        return (abilities as any)[shortName];
      }
      // Потом полное имя
      if (fullName in abilities) {
        return (abilities as any)[fullName];
      }
    }
    return 10; // Значение по умолчанию
  };

  // Обработчик изменения данных о внешности
  const handleAppearanceChange = (key: string, value: string) => {
    setAppearanceDetails(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Также сразу обновляем основной объект персонажа
    updateCharacter({ [key]: value } as any);
  };

  // Получаем доступные характеристики персонажа с безопасным доступом к ним
  const abilities = character.stats || character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  // Форматируем массивы элементов для отображения
  const formatList = (items?: string[]) => {
    if (!items || items.length === 0) return "Нет";
    return items.join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Обзор персонажа</h2>
        <p className="text-gray-300">
          Проверьте созданного персонажа и внесите финальные изменения.
          <br />
          После завершения вы сможете скачать лист персонажа или сохранить его в своем аккаунте.
        </p>
      </div>

      {/* Основная информация о персонаже */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Основные атрибуты */}
        <Card className="bg-black/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Основные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Имя:</div>
              <div className="col-span-2 font-medium text-white">{character.name || "—"}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Раса:</div>
              <div className="col-span-2 font-medium text-white">
                {character.race} {character.subrace ? `(${character.subrace})` : ""}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Класс:</div>
              <div className="col-span-2 font-medium text-white">
                {character.class} {character.subclass ? `(${character.subclass})` : ""}, {character.level} уровень
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Предыстория:</div>
              <div className="col-span-2 font-medium text-white">{character.background || "—"}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Мировоззрение:</div>
              <div className="col-span-2 font-medium text-white">{character.alignment || "—"}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 text-gray-400">Здоровье:</div>
              <div className="col-span-2 font-medium text-white">{character.maxHp || "—"} HP</div>
            </div>
          </CardContent>
        </Card>

        {/* Характеристики - исправляем доступ к свойствам */}
        <Card className="bg-black/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Характеристики</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">СИЛ</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('STR', 'strength')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('STR', 'strength'))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">ЛОВ</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('DEX', 'dexterity')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('DEX', 'dexterity'))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">ТЕЛ</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('CON', 'constitution')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('CON', 'constitution'))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">ИНТ</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('INT', 'intelligence')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('INT', 'intelligence'))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">МДР</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('WIS', 'wisdom')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('WIS', 'wisdom'))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-2 bg-black/30 rounded-md border border-gray-700">
              <span className="text-sm text-gray-400">ХАР</span>
              <span className="text-xl font-bold text-white">{getAbilityValue('CHA', 'charisma')}</span>
              <span className="text-sm font-medium text-yellow-400">
                {getAbilityModifier(getAbilityValue('CHA', 'charisma'))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Внешность и дополнительная информация */}
        <Card className="bg-black/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Внешность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="age" className="text-gray-400">Возраст</Label>
              <Input
                id="age"
                name="age"
                value={appearanceDetails.age}
                onChange={(e) => handleAppearanceChange('age', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Укажите возраст"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="height" className="text-gray-400">Рост</Label>
              <Input
                id="height"
                name="height"
                value={appearanceDetails.height}
                onChange={(e) => handleAppearanceChange('height', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder={"Например: 5'10\"/178 см"}
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="weight" className="text-gray-400">Вес</Label>
              <Input
                id="weight"
                name="weight"
                value={appearanceDetails.weight}
                onChange={(e) => handleAppearanceChange('weight', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Например: 160 фунтов/73 кг"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="eyes" className="text-gray-400">Глаза</Label>
              <Input
                id="eyes"
                name="eyes"
                value={appearanceDetails.eyes}
                onChange={(e) => handleAppearanceChange('eyes', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Цвет глаз"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="skin" className="text-gray-400">Кожа</Label>
              <Input
                id="skin"
                name="skin"
                value={appearanceDetails.skin}
                onChange={(e) => handleAppearanceChange('skin', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Цвет кожи"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <Label htmlFor="hair" className="text-gray-400">Волосы</Label>
              <Input
                id="hair"
                name="hair"
                value={appearanceDetails.hair}
                onChange={(e) => handleAppearanceChange('hair', e.target.value)}
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Цвет и стиль волос"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Аккордеоны с дополнительной информацией */}
      <div className="space-y-3">
        <Accordion type="single" collapsible className="bg-black/30 rounded-lg border border-gray-700">
          <AccordionItem value="backstory">
            <AccordionTrigger className="px-4 text-yellow-400 hover:bg-black/20">Предыстория и личность</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-2 text-gray-300">
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Черты характера</h4>
                <p>{character.personalityTraits || "Не указаны"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Идеалы</h4>
                <p>{character.ideals ? formatList(character.ideals as string[]) : "Не указаны"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Привязанности</h4>
                <p>{character.bonds ? formatList(character.bonds as string[]) : "Не указаны"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Слабости</h4>
                <p>{character.flaws ? formatList(character.flaws as string[]) : "Не указаны"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">История персонажа</h4>
                <p className="whitespace-pre-line">{character.backstory || "История персонажа не написана."}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="proficiencies">
            <AccordionTrigger className="px-4 text-yellow-400 hover:bg-black/20">Владения и языки</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3 text-gray-300">
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Доспехи</h4>
                <p>{character.proficiencies?.armor ? formatList(character.proficiencies.armor) : "Нет"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Оружие</h4>
                <p>{character.proficiencies?.weapons ? formatList(character.proficiencies.weapons) : "Нет"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Инструменты</h4>
                <p>{character.proficiencies?.tools ? formatList(character.proficiencies.tools) : "Нет"}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-200">Языки</h4>
                <p>{character.proficiencies?.languages ? formatList(character.proficiencies.languages) : 
                   character.languages ? formatList(character.languages) : "Нет"}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="features">
            <AccordionTrigger className="px-4 text-yellow-400 hover:bg-black/20">Умения и особенности</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-gray-300">
              <div className="space-y-3">
                {character.features && character.features.length > 0 ? (
                  character.features.map((feature, index) => (
                    <div key={index} className="p-2 bg-black/20 rounded border border-gray-800">
                      <p>{feature}</p>
                    </div>
                  ))
                ) : (
                  <p>Умения и особенности не указаны</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="equipment">
            <AccordionTrigger className="px-4 text-yellow-400 hover:bg-black/20">Снаряжение</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-gray-300">
              <div className="space-y-2">
                {character.equipment && character.equipment.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {character.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Снаряжение не указано</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {character.spells && character.spells.length > 0 && (
            <AccordionItem value="spells">
              <AccordionTrigger className="px-4 text-yellow-400 hover:bg-black/20">Заклинания</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Заклинания, сгруппированные по уровням */}
                    {[...Array(10)].map((_, level) => {
                      const spellsOfLevel = character.spells?.filter(spell => spell.level === level);
                      
                      if (!spellsOfLevel || spellsOfLevel.length === 0) {
                        return null;
                      }
                      
                      return (
                        <div key={level} className="space-y-2">
                          <h4 className="font-medium text-yellow-200">
                            {level === 0 ? "Заговоры" : `Уровень ${level}`}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {spellsOfLevel.map((spell, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-black/20 rounded border border-gray-800">
                                <span className="text-gray-300">{spell.name}</span>
                                {spell.ritual && (
                                  <Badge variant="outline" className="ml-auto">Ритуал</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
  
      {/* Навигационные кнопки и действия */}
      <div className="flex flex-col space-y-4">
        <NavigationButtons 
          nextStep={() => {}} 
          prevStep={prevStep} 
          allowNext={true} 
          hideNextButton={true}
          isFirstStep={false}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <Button 
            onClick={() => setShowDownloadDialog(true)}
            variant="outline"
            className="w-full bg-gray-800/70 hover:bg-gray-700 text-white border-gray-600"
          >
            Скачать JSON
          </Button>
          
          <Button
            onClick={generatePDF}
            variant="outline"
            className="w-full bg-gray-800/70 hover:bg-gray-700 text-white border-gray-600"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Создание PDF..." : "Скачать PDF"}
          </Button>
          
          <Button
            onClick={() => setShowSaveDialog(true)}
            variant="default"
            className="w-full bg-yellow-600/90 hover:bg-yellow-700 text-white"
            disabled={!currentUser}
          >
            {currentUser ? "Сохранить персонажа" : "Войдите для сохранения"}
          </Button>
        </div>
      </div>
      
      {/* Диалоговое окно для скачивания JSON */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Скачать персонажа</DialogTitle>
            <DialogDescription className="text-gray-400">
              Введите имя файла для скачивания персонажа в формате JSON.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="file-name" className="text-gray-300">Имя файла</Label>
              <Input
                id="file-name"
                name="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDownloadDialog(false)}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Отмена
              </Button>
              <Button 
                onClick={downloadCharacterAsJson}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Скачать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Диалоговое окно для сохранения персонажа */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Сохранить персонажа</DialogTitle>
            <DialogDescription className="text-gray-400">
              Персонаж будет сохранен в вашем аккаунте и доступен в разделе "Мои персонажи".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
              <p className="text-sm text-gray-300">
                Имя персонажа: <span className="font-medium text-white">{character.name}</span>
              </p>
              <p className="text-sm text-gray-300">
                Раса/Класс: <span className="font-medium text-white">{character.race} / {character.class} ({character.level} уровень)</span>
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSaveDialog(false)}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Отмена
              </Button>
              <Button 
                onClick={saveCharacterToDatabase}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacterReview;
