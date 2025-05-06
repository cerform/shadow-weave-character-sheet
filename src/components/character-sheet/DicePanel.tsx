
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const [diceType, setDiceType] = useState('d20');
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [label, setLabel] = useState('');

  // Функция для броска кубиков
  const rollDice = (
    dType = diceType,
    count = diceCount,
    mod = modifier,
    diceLabel = label
  ) => {
    const dieSize = parseInt(dType.replace('d', ''), 10);
    const rolls: number[] = [];
    
    // Генерация бросков
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * dieSize) + 1);
    }
    
    // Подсчет результата
    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = subtotal + mod;
    
    // Сохраняем результат броска
    const rollResult = {
      diceType: dType,
      count,
      modifier: mod,
      rolls,
      total,
      label: diceLabel || `${count}${dType}${mod !== 0 ? (mod > 0 ? '+' + mod : mod) : ''}`,
      timestamp: new Date().toISOString()
    };
    
    // Обновляем персонажа
    onUpdate({
      lastDiceRoll: rollResult
    });
    
    // Показываем результат
    toast({
      title: `Бросок: ${rollResult.label}`,
      description: `Результат: ${total} (${subtotal}${mod !== 0 ? (mod > 0 ? '+' + mod : mod) : ''})`,
    });
    
    return rollResult;
  };

  // Предопределенные броски
  const presetRolls = [
    { name: 'Инициатива', action: () => {
      const dexMod = Math.floor((character.dexterity ? Number(character.dexterity) - 10 : 0) / 2);
      
      // Используем сохраненный модификатор инициативы, если он есть
      const initiativeMod = character.initiative ? 
        (typeof character.initiative === 'number' ? character.initiative : 
         typeof character.initiative === 'string' && character.initiative.startsWith('+') ? 
         parseInt(character.initiative.slice(1), 10) : parseInt(character.initiative, 10) || 0) : 
        dexMod;
      
      return rollDice('d20', 1, initiativeMod, 'Инициатива');
    }},
    { name: 'Атака', action: () => {
      // Простой бросок атаки (без учета конкретного оружия)
      const strMod = Math.floor((character.strength ? Number(character.strength) - 10 : 0) / 2);
      const profBonus = character.proficiencyBonus || 2;
      return rollDice('d20', 1, strMod + profBonus, 'Атака');
    }},
    { name: 'Урон', action: () => {
      // Простой бросок урона (без учета конкретного оружия)
      const strMod = Math.floor((character.strength ? Number(character.strength) - 10 : 0) / 2);
      return rollDice('d6', 1, strMod, 'Урон');
    }},
  ];

  // Броски характеристик
  const abilityChecks = [
    { ability: 'СИЛ', key: 'strength' },
    { ability: 'ЛВК', key: 'dexterity' },
    { ability: 'ТЕЛ', key: 'constitution' },
    { ability: 'ИНТ', key: 'intelligence' },
    { ability: 'МДР', key: 'wisdom' },
    { ability: 'ХАР', key: 'charisma' },
  ];

  const rollAbilityCheck = (abilityKey: string) => {
    const abilityScore = character[abilityKey as keyof Character];
    const mod = Math.floor((typeof abilityScore === 'number' ? abilityScore - 10 : 0) / 2);
    return rollDice('d20', 1, mod, `Проверка ${abilityKey}`);
  };

  // Предыдущий бросок
  const renderLastRoll = () => {
    if (!character.lastDiceRoll) return null;
    
    const { label, total, rolls, modifier } = character.lastDiceRoll;
    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);
    
    return (
      <div className="mt-4 p-2 border rounded-md bg-muted/20">
        <div className="font-medium">Последний бросок: {label}</div>
        <div className="flex justify-between items-center text-sm">
          <span>Результат: {total}</span>
          <span className="text-muted-foreground">
            {subtotal}{modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Броски: {rolls.join(', ')}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кости</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="presets">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="presets">Общие броски</TabsTrigger>
            <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-2 pt-2">
            {/* Предопределенные броски */}
            <div className="grid grid-cols-3 gap-2">
              {presetRolls.map((roll, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm" 
                  onClick={roll.action}
                  className="w-full"
                >
                  {roll.name}
                </Button>
              ))}
            </div>
            
            {/* Пользовательский бросок */}
            <div className="space-y-2 mt-4">
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={diceCount}
                  onChange={(e) => setDiceCount(parseInt(e.target.value, 10))}
                  className="bg-background border rounded px-2 py-1 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
                <select 
                  value={diceType}
                  onChange={(e) => setDiceType(e.target.value)}
                  className="bg-background border rounded px-2 py-1 text-sm"
                >
                  {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select 
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value, 10))}
                  className="bg-background border rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 21 }, (_, i) => i - 10).map((mod) => (
                    <option key={mod} value={mod}>{mod >= 0 ? '+' + mod : mod}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Метка броска"
                  className="bg-background border rounded px-2 py-1 text-sm flex-1"
                />
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => rollDice()}
                >
                  Бросить
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="abilities" className="pt-2">
            <div className="grid grid-cols-3 gap-2">
              {abilityChecks.map((ability) => (
                <Button 
                  key={ability.key}
                  variant="outline" 
                  size="sm" 
                  onClick={() => rollAbilityCheck(ability.key)}
                  className="w-full"
                >
                  {ability.ability}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Последний бросок */}
        {renderLastRoll()}
      </CardContent>
    </Card>
  );
};

export default DicePanel;
