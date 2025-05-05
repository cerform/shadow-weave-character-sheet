
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ABILITY_SCORE_CAPS } from '@/types/character';

interface CharacterAbilitiesProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterAbilities: React.FC<CharacterAbilitiesProps> = ({
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const { toast } = useToast();
  const [abilities, setAbilities] = useState({
    STR: character?.abilities?.STR || character?.stats?.strength || 10,
    DEX: character?.abilities?.DEX || character?.stats?.dexterity || 10,
    CON: character?.abilities?.CON || character?.stats?.constitution || 10,
    INT: character?.abilities?.INT || character?.stats?.intelligence || 10,
    WIS: character?.abilities?.WIS || character?.stats?.wisdom || 10,
    CHA: character?.abilities?.CHA || character?.stats?.charisma || 10
  });
  
  const [method, setMethod] = useState<'standard' | 'pointbuy' | 'roll' | 'manual'>('standard');
  const [pointsLeft, setPointsLeft] = useState(27);
  const [maxValue, setMaxValue] = useState(ABILITY_SCORE_CAPS.BASE_CAP);

  // Определяем стоимость очков для point buy
  const pointCost = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
  };

  // Стандартный массив значений
  const standardArray = [15, 14, 13, 12, 10, 8];
  
  useEffect(() => {
    // Устанавливаем максимальное значение в зависимости от уровня
    if (character.level >= 16) {
      setMaxValue(ABILITY_SCORE_CAPS.LEGENDARY_CAP);
    } else if (character.level >= 10) {
      setMaxValue(ABILITY_SCORE_CAPS.EPIC_CAP);
    } else {
      setMaxValue(ABILITY_SCORE_CAPS.BASE_CAP);
    }
    
    // Инициализируем метод
    initializeMethod('standard');
  }, []);
  
  const initializeMethod = (newMethod: 'standard' | 'pointbuy' | 'roll' | 'manual') => {
    setMethod(newMethod);
    
    if (newMethod === 'standard') {
      // Используем стандартный массив
      setAbilities({
        STR: 15,
        DEX: 14,
        CON: 13,
        INT: 12,
        WIS: 10,
        CHA: 8
      });
    } else if (newMethod === 'pointbuy') {
      // Сбрасываем все значения до 8 для point buy
      setAbilities({
        STR: 8,
        DEX: 8,
        CON: 8,
        INT: 8,
        WIS: 8,
        CHA: 8
      });
      setPointsLeft(27);
    } else if (newMethod === 'roll') {
      // Для метода бросков генерируем случайные значения
      const rollAbility = () => {
        // Бросаем 4d6, отбрасываем наименьший
        const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => b - a);
        return rolls[0] + rolls[1] + rolls[2];
      };
      
      setAbilities({
        STR: rollAbility(),
        DEX: rollAbility(),
        CON: rollAbility(),
        INT: rollAbility(),
        WIS: rollAbility(),
        CHA: rollAbility()
      });
      
      toast({
        title: "Кости брошены!",
        description: "Случайные значения характеристик сгенерированы."
      });
    }
    // Для manual не меняем текущие значения
  };
  
  // Расчет модификатора характеристики
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Обработчики для point buy
  const incrementAbility = (ability: keyof typeof abilities) => {
    if (abilities[ability] < 15) {
      const cost = pointCost[abilities[ability] + 1 as keyof typeof pointCost] - pointCost[abilities[ability] as keyof typeof pointCost];
      
      if (pointsLeft >= cost) {
        setAbilities({...abilities, [ability]: abilities[ability] + 1});
        setPointsLeft(pointsLeft - cost);
      } else {
        toast({
          title: "Недостаточно очков",
          description: `Нужно ${cost} очков, доступно ${pointsLeft}`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Достигнут максимум",
        description: "Максимальное значение в point buy - 15",
        variant: "destructive"
      });
    }
  };
  
  const decrementAbility = (ability: keyof typeof abilities) => {
    if (abilities[ability] > 8) {
      const refund = pointCost[abilities[ability] as keyof typeof pointCost] - pointCost[abilities[ability] - 1 as keyof typeof pointCost];
      
      setAbilities({...abilities, [ability]: abilities[ability] - 1});
      setPointsLeft(pointsLeft + refund);
    }
  };
  
  // Обработчики для manual
  const updateAbility = (ability: keyof typeof abilities, value: number) => {
    if (value >= 1 && value <= maxValue) {
      setAbilities({...abilities, [ability]: value});
    }
  };
  
  const handleNext = () => {
    // Форматируем abilities для сохранения
    const abilitiesData = {
      // Короткие имена для совместимости
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA,
      // Полные имена для удобства
      strength: abilities.STR,
      dexterity: abilities.DEX,
      constitution: abilities.CON,
      intelligence: abilities.INT,
      wisdom: abilities.WIS,
      charisma: abilities.CHA
    };
    
    const stats = {
      strength: abilities.STR,
      dexterity: abilities.DEX,
      constitution: abilities.CON,
      intelligence: abilities.INT,
      wisdom: abilities.WIS,
      charisma: abilities.CHA
    };
    
    // Сохраняем характеристики
    onUpdate({ 
      abilities: abilitiesData,
      stats: stats
    });
    
    // Переходим к следующему шагу
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Характеристики персонажа</h2>
      
      {/* Селектор метода */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Выберите метод определения характеристик:</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={method === 'standard' ? 'default' : 'outline'}
            onClick={() => initializeMethod('standard')}
          >
            Стандартный набор
          </Button>
          <Button
            variant={method === 'pointbuy' ? 'default' : 'outline'}
            onClick={() => initializeMethod('pointbuy')}
          >
            Покупка очков
          </Button>
          <Button
            variant={method === 'roll' ? 'default' : 'outline'}
            onClick={() => initializeMethod('roll')}
          >
            Броски
          </Button>
          <Button
            variant={method === 'manual' ? 'default' : 'outline'}
            onClick={() => initializeMethod('manual')}
          >
            Ручной ввод
          </Button>
        </div>
      </div>
      
      {/* Интерфейс для выбранного метода */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {method === 'pointbuy' && (
            <div className="mb-3 flex justify-between items-center">
              <span>Доступно очков: <strong>{pointsLeft}</strong></span>
              <span className="text-sm text-muted-foreground">
                (Стандартные значения: {standardArray.join(', ')})
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(abilities).map(([ability, score]) => (
              <div key={ability} className="border rounded-lg p-4">
                <div className="text-center mb-1">
                  <span className="font-bold">{ability}</span>
                </div>
                
                {method === 'manual' ? (
                  // Для ручного метода показываем инпут
                  <input
                    type="number"
                    min="1"
                    max={maxValue}
                    value={score}
                    onChange={(e) => updateAbility(ability as keyof typeof abilities, parseInt(e.target.value) || 0)}
                    className="w-full text-center p-1 border rounded"
                  />
                ) : (
                  // Для других методов показываем значение с кнопками +/-
                  <div className="flex items-center justify-between">
                    {method === 'pointbuy' && (
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => decrementAbility(ability as keyof typeof abilities)}
                        disabled={score <= 8}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold">{score}</span>
                      <span className="text-sm text-muted-foreground">
                        Мод: {getModifier(score)}
                      </span>
                    </div>
                    
                    {method === 'pointbuy' && (
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => incrementAbility(ability as keyof typeof abilities)}
                        disabled={score >= 15 || pointsLeft <= 0}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {method === 'roll' && (
            <Button 
              className="w-full mt-4" 
              onClick={() => initializeMethod('roll')}
            >
              Перебросить все
            </Button>
          )}
        </CardContent>
      </Card>
      
      <NavigationButtons
        allowNext={true}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterAbilities;
