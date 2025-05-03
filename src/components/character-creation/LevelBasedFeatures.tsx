
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLevelFeatures, LevelFeature } from '@/hooks/useLevelFeatures';
import { CharacterSheet } from '@/types/character';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

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
  
  // Состояние для модальных окон
  const [showSubclassModal, setShowSubclassModal] = useState(false);
  const [showAbilityIncreaseModal, setShowAbilityIncreaseModal] = useState(false);
  const [selectedAbilityIncreaseType, setSelectedAbilityIncreaseType] = useState<string>('');
  
  // Состояние для выбора характеристик при увеличении
  const [abilityIncreases, setAbilityIncreases] = useState<{
    first: { ability: string, value: number },
    second: { ability: string, value: number }
  }>({
    first: { ability: '', value: 0 },
    second: { ability: '', value: 0 }
  });

  // Открытие диалога выбора архетипа
  const openSubclassDialog = () => {
    setShowSubclassModal(true);
    setExpandedFeature('subclass');
  };

  // Открытие диалога увеличения характеристик
  const openAbilityIncreaseDialog = () => {
    setShowAbilityIncreaseModal(true);
    setExpandedFeature('ability_increase');
  };

  // Обработка выбора архетипа
  const handleSubclassSelect = (value: string) => {
    updateCharacter({ subclass: value });
    selectFeature('subclass', value);
    setShowSubclassModal(false);
  };

  // Обработка выбора типа увеличения характеристик
  const handleAbilityIncreaseTypeSelect = (type: string) => {
    setSelectedAbilityIncreaseType(type);
    selectFeature('ability_increase', type);
    
    // Сбросить выбранные характеристики при смене типа
    setAbilityIncreases({
      first: { ability: '', value: 0 },
      second: { ability: '', value: 0 }
    });
  };

  // Обработка выбора характеристики для увеличения
  const handleAbilitySelect = (ability: string, position: 'first' | 'second') => {
    setAbilityIncreases(prev => ({
      ...prev,
      [position]: { 
        ability, 
        value: selectedAbilityIncreaseType === 'single_2' ? 2 : 1 
      }
    }));
  };

  // Применение увеличения характеристик
  const applyAbilityIncrease = () => {
    if (selectedAbilityIncreaseType === 'single_2' && abilityIncreases.first.ability) {
      // Увеличиваем одну характеристику на 2
      const updatedAbilities = { ...character.abilities };
      const abilityKey = abilityIncreases.first.ability.toLowerCase() as keyof typeof updatedAbilities;
      updatedAbilities[abilityKey] += 2;
      updateCharacter({ abilities: updatedAbilities });
      
    } else if (selectedAbilityIncreaseType === 'dual_1' && 
               abilityIncreases.first.ability && 
               abilityIncreases.second.ability) {
      // Увеличиваем две характеристики на 1
      const updatedAbilities = { ...character.abilities };
      const firstKey = abilityIncreases.first.ability.toLowerCase() as keyof typeof updatedAbilities;
      const secondKey = abilityIncreases.second.ability.toLowerCase() as keyof typeof updatedAbilities;
      updatedAbilities[firstKey] += 1;
      updatedAbilities[secondKey] += 1;
      updateCharacter({ abilities: updatedAbilities });
    }
    
    // Добавляем особенность в список особенностей персонажа
    const features = character.features || [];
    features.push(`Увеличение характеристик (${selectedAbilityIncreaseType === 'single_2' ? 
      abilityIncreases.first.ability + ' +2' : 
      abilityIncreases.first.ability + ' +1, ' + abilityIncreases.second.ability + ' +1'})`);
    
    updateCharacter({ features });
    setShowAbilityIncreaseModal(false);
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
        return ["Коллегия Знания", "Коллегия Доблести"];
      default:
        return [];
    }
  };

  // Получить список способностей для выбора
  const getAbilityOptions = () => {
    return [
      { value: "strength", label: "Сила" },
      { value: "dexterity", label: "Ловкость" },
      { value: "constitution", label: "Телосложение" },
      { value: "intelligence", label: "Интеллект" },
      { value: "wisdom", label: "Мудрость" },
      { value: "charisma", label: "Харизма" }
    ];
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
                  className="flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    {feature.type === 'subclass' && character.subclass && (
                      <Badge variant="secondary" className="mt-2">
                        Выбрано: {character.subclass}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (feature.type === 'subclass') {
                        openSubclassDialog();
                      } else if (feature.type === 'ability_increase') {
                        openAbilityIncreaseDialog();
                      } else {
                        setExpandedFeature(expandedFeature === feature.type ? null : feature.type);
                      }
                    }}
                  >
                    Детали
                  </Button>
                </div>
                
                {expandedFeature === feature.type && feature.type !== 'subclass' && feature.type !== 'ability_increase' && (
                  <div className="mt-3 pt-3 border-t border-border">
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

      {/* Модальное окно для выбора архетипа */}
      <Dialog open={showSubclassModal} onOpenChange={setShowSubclassModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите архетип для {character.class}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Select 
              onValueChange={handleSubclassSelect}
              value={character.subclass || ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите архетип" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSubclasses(character.class).map((subclass) => (
                  <SelectItem key={subclass} value={subclass}>
                    {subclass}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно для увеличения характеристик */}
      <Dialog open={showAbilityIncreaseModal} onOpenChange={setShowAbilityIncreaseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Увеличение характеристик</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <Label>Выберите способ распределения:</Label>
              <RadioGroup 
                className="space-y-2"
                value={selectedAbilityIncreaseType}
                onValueChange={handleAbilityIncreaseTypeSelect}
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

            {selectedAbilityIncreaseType === 'single_2' && (
              <div className="space-y-3">
                <Label>Выберите характеристику для увеличения на +2:</Label>
                <Select 
                  onValueChange={(value) => handleAbilitySelect(value, 'first')}
                  value={abilityIncreases.first.ability}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите характеристику" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAbilityOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAbilityIncreaseType === 'dual_1' && (
              <div className="space-y-3">
                <Label>Выберите две разные характеристики для увеличения на +1:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select 
                    onValueChange={(value) => handleAbilitySelect(value, 'first')}
                    value={abilityIncreases.first.ability}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Первая" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAbilityOptions()
                        .filter(opt => opt.value !== abilityIncreases.second.ability)
                        .map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    onValueChange={(value) => handleAbilitySelect(value, 'second')}
                    value={abilityIncreases.second.ability}
                    disabled={!abilityIncreases.first.ability}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Вторая" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAbilityOptions()
                        .filter(opt => opt.value !== abilityIncreases.first.ability)
                        .map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedAbilityIncreaseType === 'feat' && (
              <div className="space-y-3">
                <div className="bg-primary/5 p-3 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <p className="text-sm">Выбор подвига будет доступен в следующем обновлении. Пожалуйста, выберите другой способ распределения очков.</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={applyAbilityIncrease}
              disabled={
                selectedAbilityIncreaseType === 'single_2' && !abilityIncreases.first.ability ||
                selectedAbilityIncreaseType === 'dual_1' && (!abilityIncreases.first.ability || !abilityIncreases.second.ability) ||
                selectedAbilityIncreaseType === 'feat'
              }
            >
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LevelBasedFeatures;
