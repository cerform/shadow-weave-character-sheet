
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLevelFeatures, LevelFeature } from '@/hooks/useLevelFeatures';
import { CharacterSheet } from '@/types/character';

interface LevelBasedFeaturesProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
}

const LevelBasedFeatures: React.FC<LevelBasedFeaturesProps> = ({
  character,
  updateCharacter
}) => {
  const { availableFeatures, selectedFeatures, selectFeature, getHitDiceInfo } = useLevelFeatures(character);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Функция для отображения деталей особенности
  const toggleFeatureDetails = (featureType: string) => {
    if (expandedFeature === featureType) {
      setExpandedFeature(null);
    } else {
      setExpandedFeature(featureType);
    }
  };

  // Отображение выбора архетипа (подкласса)
  const renderSubclassSelection = (feature: LevelFeature) => {
    const subclasses = getAvailableSubclasses(character.class);
    
    return (
      <div className="mt-4">
        <Label htmlFor="subclass-select">Выберите архетип:</Label>
        <Select 
          onValueChange={(value) => {
            selectFeature('subclass', value);
            updateCharacter({ subclass: value });
          }}
          value={character.subclass || ''}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Выберите архетип" />
          </SelectTrigger>
          <SelectContent>
            {subclasses.map((subclass) => (
              <SelectItem key={subclass} value={subclass}>
                {subclass}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Отображение увеличения характеристик
  const renderAbilityScoreImprovement = (feature: LevelFeature) => {
    // В будущем можно добавить возможность выбора, какие характеристики улучшать
    return (
      <div className="mt-4">
        <p className="text-sm">
          На {feature.level} уровне вы получаете возможность увеличить характеристики:
        </p>
        <RadioGroup 
          className="mt-2"
          onValueChange={(value) => selectFeature('ability_increase', value)}
          value={selectedFeatures['ability_increase'] || ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single_2" id="single_2" />
            <Label htmlFor="single_2">Увеличить одну характеристику на 2</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dual_1" id="dual_1" />
            <Label htmlFor="dual_1">Увеличить две характеристики на 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feat" id="feat" />
            <Label htmlFor="feat">Взять черту (подвиг)</Label>
          </div>
        </RadioGroup>
      </div>
    );
  };

  // Получаем доступные подклассы для класса
  const getAvailableSubclasses = (className: string): string[] => {
    switch (className) {
      case "Воин":
        return ["Мастер боевых искусств", "Чемпион", "Мистический рыцарь"];
      case "Варвар":
        return ["Путь берсерка", "Путь тотемного война"];
      case "Следопыт":
        return ["Охотник", "Повелитель зверей"];
      case "Плут":
        return ["Вор", "Убийца", "Мистический ловкач"];
      case "Чародей":
        return ["Наследие дракона", "Дикая магия"];
      case "Колдун":
        return ["Архифея", "Исчадие", "Великий Древний"];
      case "Волшебник":
        return ["Школа Воплощения", "Школа Вызова", "Школа Иллюзии", "Школа Некромантии", "Школа Ограждения", "Школа Очарования", "Школа Преобразования", "Школа Прорицания"];
      case "Жрец":
        return ["Домен Бури", "Домен Войны", "Домен Жизни", "Домен Знания", "Домен Обмана", "Домен Природы", "Домен Света"];
      case "Друид":
        return ["Круг Земли", "Круг Луны"];
      case "Монах":
        return ["Путь Открытой Ладони", "Путь Тени", "Путь Четырех Стихий"];
      case "Паладин":
        return ["Клятва Преданности", "Клятва Древних", "Клятва Мести"];
      case "Бард":
        return ["Коллегия Знаний", "Коллегия Доблести"];
      default:
        return [];
    }
  };

  // Группировка особенностей по уровням
  const groupedFeatures: {[level: number]: LevelFeature[]} = availableFeatures.reduce(
    (acc, feature) => {
      if (!acc[feature.level]) {
        acc[feature.level] = [];
      }
      acc[feature.level].push(feature);
      return acc;
    },
    {} as {[level: number]: LevelFeature[]}
  );

  // Если нет доступных особенностей
  if (Object.keys(groupedFeatures).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Доступные особенности</h3>
      
      {Object.entries(groupedFeatures).map(([level, features]) => (
        <Card key={level} className="overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/10 py-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Уровень {level}</span>
              <Badge variant="outline" className="font-normal">
                {features.length} {features.length === 1 ? 'особенность' : 'особенности'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-border">
            {features.map((feature) => (
              <div key={feature.name} className="py-3 first:pt-0 last:pb-0">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFeatureDetails(feature.type)}
                >
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFeatureDetails(feature.type);
                    }}
                  >
                    {expandedFeature === feature.type ? 'Скрыть' : 'Детали'}
                  </Button>
                </div>
                
                {expandedFeature === feature.type && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {feature.type === 'subclass' && renderSubclassSelection(feature)}
                    {feature.type === 'ability_increase' && renderAbilityScoreImprovement(feature)}
                    {feature.type === 'extra_attack' && (
                      <p className="text-sm">
                        На 5 уровне вы получаете способность совершать дополнительную атаку в свой ход.
                      </p>
                    )}
                    {feature.type === 'spell_level' && (
                      <p className="text-sm">
                        Вы получаете доступ к новым заклинаниям. Не забудьте выбрать их на вкладке заклинаний.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LevelBasedFeatures;
