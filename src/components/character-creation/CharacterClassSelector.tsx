
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterSheet, ClassLevel } from "@/types/character";

interface CharacterClassSelectorProps {
  character: CharacterSheet;
  onClassChange: (characterClass: string) => void;
  onLevelChange: (level: number) => void;
  onAdditionalClassChange: (additionalClasses: ClassLevel[]) => void;
  onSubclassChange: (subclass: string) => void;
}

export const CharacterClassSelector: React.FC<CharacterClassSelectorProps> = ({
  character,
  onClassChange,
  onLevelChange,
  onAdditionalClassChange,
  onSubclassChange
}) => {
  const [showMulticlass, setShowMulticlass] = useState(false);

  // Список классов
  const classes = [
    "Бард", "Варвар", "Воин", "Волшебник", "Друид", "Жрец", 
    "Колдун", "Монах", "Паладин", "Плут", "Следопыт", "Чародей"
  ];

  // Список подклассов для каждого класса
  const subclasses: Record<string, string[]> = {
    "Бард": ["Коллегия Знаний", "Коллегия Доблести", "Коллегия Красноречия"],
    "Варвар": ["Путь Берсерка", "Путь Тотемного Воина", "Путь Предка-Хранителя"],
    "Воин": ["Мастер боевых искусств", "Рыцарь", "Чемпион", "Боевой маг"],
    "Волшебник": ["Школа Вызова", "Школа Иллюзий", "Школа Некромантии", "Школа Преобразования"],
    "Друид": ["Круг Земли", "Круг Луны", "Круг Спор", "Круг Звёзд"],
    "Жрец": ["Домен Жизни", "Домен Света", "Домен Природы", "Домен Бури", "Домен Войны"],
    "Колдун": ["Архифея", "Исчадие", "Великий Древний"],
    "Монах": ["Путь Открытой Ладони", "Путь Тени", "Путь Четырёх Стихий"],
    "Паладин": ["Клятва Преданности", "Клятва Древних", "Клятва Мести"],
    "Плут": ["Вор", "Убийца", "Мистический ловкач"],
    "Следопыт": ["Охотник", "Повелитель зверей", "Сумрачный странник"],
    "Чародей": ["Наследие дракона", "Дикая магия", "Теневая магия"]
  };

  // Обработчики изменений
  const handleClassChange = (value: string) => {
    onClassChange(value);
    
    // Если есть подклассы для выбранного класса, выбираем первый по умолчанию
    if (subclasses[value] && subclasses[value].length > 0) {
      onSubclassChange(subclasses[value][0]);
    } else {
      onSubclassChange("");
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(e.target.value);
    if (!isNaN(level) && level >= 1 && level <= 20) {
      onLevelChange(level);
    }
  };

  const handleSubclassChange = (value: string) => {
    onSubclassChange(value);
  };

  const handleAddMulticlass = () => {
    const currentAdditionalClasses = [...(character.additionalClasses || [])];
    
    // Находим класс, которого ещё нет в списке и который отличается от основного
    const availableClass = classes.find(c => 
      c !== character.class && 
      !currentAdditionalClasses.some(ac => ac.class === c)
    );
    
    if (availableClass) {
      currentAdditionalClasses.push({
        class: availableClass,
        level: 1
      });
      
      onAdditionalClassChange(currentAdditionalClasses);
    }
  };

  const handleRemoveMulticlass = (index: number) => {
    const currentAdditionalClasses = [...(character.additionalClasses || [])];
    currentAdditionalClasses.splice(index, 1);
    onAdditionalClassChange(currentAdditionalClasses);
  };

  const handleMulticlassChange = (index: number, newClass: string) => {
    const currentAdditionalClasses = [...(character.additionalClasses || [])];
    currentAdditionalClasses[index].class = newClass;
    onAdditionalClassChange(currentAdditionalClasses);
  };

  const handleMulticlassLevelChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(e.target.value);
    if (!isNaN(level) && level >= 1 && level <= 20) {
      const currentAdditionalClasses = [...(character.additionalClasses || [])];
      currentAdditionalClasses[index].level = level;
      onAdditionalClassChange(currentAdditionalClasses);
    }
  };

  // Расчет общего уровня
  const totalLevel = character.level + 
    (character.additionalClasses?.reduce((sum, cls) => sum + cls.level, 0) || 0);

  // Проверка, можно ли добавить ещё один класс мультикласса
  const canAddMulticlass = totalLevel < 20 && 
    (character.additionalClasses?.length || 0) < classes.length - 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Выбор класса</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="characterClass">Основной класс</Label>
            <Select 
              value={character.class || ''} 
              onValueChange={handleClassChange}
            >
              <SelectTrigger id="characterClass" className="w-full">
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {character.class && (
            <div className="space-y-2">
              <Label htmlFor="subclass">Подкласс (архетип)</Label>
              <Select 
                value={character.subclass || ''} 
                onValueChange={handleSubclassChange}
              >
                <SelectTrigger id="subclass" className="w-full">
                  <SelectValue placeholder="Выберите подкласс" />
                </SelectTrigger>
                <SelectContent>
                  {subclasses[character.class]?.map((subcls) => (
                    <SelectItem key={subcls} value={subcls}>
                      {subcls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="level">Уровень</Label>
            <Input 
              id="level" 
              type="number" 
              value={character.level || 1} 
              onChange={handleLevelChange}
              min={1} 
              max={20}
            />
          </div>

          <div className="pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowMulticlass(!showMulticlass)}
            >
              {showMulticlass ? 'Скрыть мультикласс' : 'Показать мультикласс'}
            </Button>
          </div>

          {showMulticlass && (
            <div className="space-y-4">
              <div className="text-sm">
                Общий уровень: {totalLevel}/20
              </div>

              {character.additionalClasses?.map((additionalClass, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">
                    <Select 
                      value={additionalClass.class} 
                      onValueChange={(value) => handleMulticlassChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите класс" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.filter(c => 
                          c !== character.class && 
                          !character.additionalClasses?.some((ac, i) => i !== index && ac.class === c)
                        ).map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input 
                      type="number" 
                      value={additionalClass.level} 
                      onChange={(e) => handleMulticlassLevelChange(index, e)}
                      min={1} 
                      max={19}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleRemoveMulticlass(index)}
                    >
                      X
                    </Button>
                  </div>
                </div>
              ))}

              {canAddMulticlass && (
                <Button 
                  variant="outline" 
                  onClick={handleAddMulticlass}
                >
                  Добавить класс
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
