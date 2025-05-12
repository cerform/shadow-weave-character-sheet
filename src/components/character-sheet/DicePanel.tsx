
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const [diceType, setDiceType] = useState('d20');
  const [numberOfDice, setNumberOfDice] = useState('1');
  const [modifier, setModifier] = useState('0');
  const [rollType, setRollType] = useState('normal');

  // Функция для броска костей
  const rollDice = () => {
    const numDice = parseInt(numberOfDice) || 1;
    const mod = parseInt(modifier) || 0;
    const dSize = parseInt(diceType.replace('d', '')) || 20;
    
    // Проверка на максимальный размер кости
    if (dSize <= 0 || dSize > 100) {
      toast({
        title: "Неверный размер кости",
        description: "Выберите кость размером от d1 до d100",
        variant: "destructive"
      });
      return;
    }
    
    // Проверка на количество костей
    if (numDice <= 0 || numDice > 100) {
      toast({
        title: "Неверное количество костей",
        description: "Выберите от 1 до 100 костей",
        variant: "destructive"
      });
      return;
    }
    
    const rolls: number[] = [];
    let total = 0;
    
    if (rollType === 'advantage' || rollType === 'disadvantage') {
      // Для преимущества и помехи бросаем две кости
      const roll1 = Array(numDice).fill(0).map(() => Math.floor(Math.random() * dSize) + 1);
      const roll2 = Array(numDice).fill(0).map(() => Math.floor(Math.random() * dSize) + 1);
      
      const sum1 = roll1.reduce((a, b) => a + b, 0) + mod;
      const sum2 = roll2.reduce((a, b) => a + b, 0) + mod;
      
      // Для преимущества берем больший результат, для помехи - меньший
      if (rollType === 'advantage') {
        total = Math.max(sum1, sum2);
        rolls.push(...roll1, ...roll2);
      } else {
        total = Math.min(sum1, sum2);
        rolls.push(...roll1, ...roll2);
      }
    } else {
      // Обычный бросок
      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * dSize) + 1;
        rolls.push(roll);
        total += roll;
      }
      total += mod;
    }
    
    // Сохраняем результат броска
    const result = {
      diceType,
      numberOfDice: parseInt(numberOfDice),
      modifier: mod,
      rolls,
      total,
      rollType,
      timestamp: new Date().toISOString()
    };
    
    // Обновляем персонажа с результатом последнего броска
    onUpdate({
      lastDiceRoll: result
    } as Partial<Character>);
    
    // Показываем уведомление с результатом
    toast({
      title: "Результат броска",
      description: `${numberOfDice}${diceType}${mod >= 0 ? '+' : ''}${mod} = ${total}`,
    });
  };

  // Рендер последнего броска
  const renderLastRoll = () => {
    if (!character.lastDiceRoll) return null;
    
    const { diceType, numberOfDice, modifier, rolls, total, rollType, timestamp } = character.lastDiceRoll;
    
    return (
      <div className="mt-4 p-3 bg-accent/10 rounded-md">
        <h4 className="font-medium mb-1">Последний бросок:</h4>
        <div className="text-sm space-y-1">
          <div>Формула: {numberOfDice}{diceType}{modifier >= 0 ? '+' : ''}{modifier}</div>
          <div>Тип: {rollType === 'normal' ? 'Обычный' : rollType === 'advantage' ? 'С преимуществом' : 'С помехой'}</div>
          <div>Результат: <span className="font-bold">{total}</span></div>
          <div>Броски: {rolls.join(', ')}</div>
          <div>Время: {new Date(timestamp).toLocaleTimeString()}</div>
        </div>
      </div>
    );
  };

  // Получить бонус для характеристики
  const getAbilityModifier = (abilityName: string): number => {
    const abilityScore = character[abilityName.toLowerCase() as keyof Character] as number || 10;
    return Math.floor((abilityScore - 10) / 2);
  };

  // Быстрые броски на характеристики
  const handleAbilityCheck = (abilityName: string) => {
    const modifier = getAbilityModifier(abilityName);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    
    // Сохраняем результат броска
    const result = {
      diceType: 'd20',
      numberOfDice: 1,
      modifier,
      rolls: [roll],
      total,
      rollType: 'normal',
      abilityName,
      timestamp: new Date().toISOString()
    };
    
    // Обновляем персонажа с результатом последнего броска
    onUpdate({
      lastDiceRoll: result
    } as Partial<Character>);
    
    // Показываем уведомление с результатом
    toast({
      title: `Проверка ${abilityName}`,
      description: `1d20${modifier >= 0 ? '+' : ''}${modifier} = ${total} (бросок: ${roll})`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Броски костей</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Универсальный бросок кубика */}
          <div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="col-span-1">
                <Select value={numberOfDice} onValueChange={setNumberOfDice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Кол-во" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Select value={diceType} onValueChange={setDiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Кость" />
                  </SelectTrigger>
                  <SelectContent>
                    {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map(die => (
                      <SelectItem key={die} value={die}>{die}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Input
                  type="text"
                  value={modifier}
                  onChange={(e) => setModifier(e.target.value)}
                  className="w-full"
                  placeholder="Мод."
                />
              </div>
              
              <div className="col-span-1">
                <Select value={rollType} onValueChange={setRollType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Обычный</SelectItem>
                    <SelectItem value="advantage">С преимуществом</SelectItem>
                    <SelectItem value="disadvantage">С помехой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={rollDice} className="w-full">
              Бросить кости
            </Button>
          </div>
          
          {/* Быстрые броски на характеристики */}
          <div>
            <h4 className="font-medium mb-2">Проверки характеристик</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => handleAbilityCheck('strength')}>
                СИЛ {getAbilityModifier('strength') >= 0 ? '+' : ''}{getAbilityModifier('strength')}
              </Button>
              <Button variant="outline" onClick={() => handleAbilityCheck('dexterity')}>
                ЛОВ {getAbilityModifier('dexterity') >= 0 ? '+' : ''}{getAbilityModifier('dexterity')}
              </Button>
              <Button variant="outline" onClick={() => handleAbilityCheck('constitution')}>
                ТЕЛ {getAbilityModifier('constitution') >= 0 ? '+' : ''}{getAbilityModifier('constitution')}
              </Button>
              <Button variant="outline" onClick={() => handleAbilityCheck('intelligence')}>
                ИНТ {getAbilityModifier('intelligence') >= 0 ? '+' : ''}{getAbilityModifier('intelligence')}
              </Button>
              <Button variant="outline" onClick={() => handleAbilityCheck('wisdom')}>
                МДР {getAbilityModifier('wisdom') >= 0 ? '+' : ''}{getAbilityModifier('wisdom')}
              </Button>
              <Button variant="outline" onClick={() => handleAbilityCheck('charisma')}>
                ХАР {getAbilityModifier('charisma') >= 0 ? '+' : ''}{getAbilityModifier('charisma')}
              </Button>
            </div>
          </div>
          
          {/* Отображение последнего броска */}
          {character.lastDiceRoll && renderLastRoll()}
        </div>
      </CardContent>
    </Card>
  );
};

export default DicePanel;
