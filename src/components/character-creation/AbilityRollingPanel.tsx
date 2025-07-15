
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AbilityRollingPanelProps {
  diceResults: number[][];
  assignedDice: { [key: string]: number | null };
  onRollAllAbilities: () => void;
  onAssignDiceToStat: (stat: string, diceIndex: number) => void;
  onRollSingleAbility?: (ability: string) => void;
  stats: { [key: string]: number };
  getModifier: (score: number) => string;
}

const abilityNames: { [key: string]: string } = {
  strength: "Сила",
  dexterity: "Ловкость",
  constitution: "Телосложение",
  intelligence: "Интеллект",
  wisdom: "Мудрость",
  charisma: "Харизма"
};

const AbilityRollingPanel: React.FC<AbilityRollingPanelProps> = ({
  diceResults,
  assignedDice,
  onRollAllAbilities,
  onAssignDiceToStat,
  onRollSingleAbility,
  stats,
  getModifier
}) => {
  const [isRollingInProgress, setIsRollingInProgress] = useState(false);
  const [rollingAbility, setRollingAbility] = useState<string | null>(null);
  
  // Обработчик броска для всех характеристик
  const handleRollAll = () => {
    setIsRollingInProgress(true);
    onRollAllAbilities();
    setTimeout(() => {
      setIsRollingInProgress(false);
    }, 1000);
  };
  
  // Обработчик броска для одной характеристики
  const handleSingleRoll = (ability: string) => {
    if (!onRollSingleAbility) return;
    
    setRollingAbility(ability);
    setIsRollingInProgress(true);
    onRollSingleAbility(ability);
    setTimeout(() => {
      setRollingAbility(null);
      setIsRollingInProgress(false);
    }, 1000);
  };
  
  // Получаем сумму броска (исключая наименьшее значение)
  const getDiceTotal = (diceResults: number[]): number => {
    if (!diceResults || diceResults.length === 0) return 0;
    
    // Сортируем кубики и берем 3 наибольших (отбрасываем наименьший)
    const sorted = [...diceResults].sort((a, b) => b - a);
    return sorted.slice(0, 3).reduce((sum, dice) => sum + dice, 0);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-black/60 border-primary/20">
        <AlertDescription>
          Для генерации характеристик используется метод "4d6 drop lowest" - 
          бросаются 4 кубика d6 и из результата исключается наименьшее значение.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-center mb-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleRollAll}
          disabled={isRollingInProgress}
          className="bg-primary/10 border-primary/30 hover:bg-primary/20"
        >
          <Dices className="mr-2 h-5 w-5" />
          Бросить кубики для всех характеристик
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stats).map(([stat, value], statIndex) => (
          <div key={stat} className="border rounded-md p-4 bg-black/50 border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">{abilityNames[stat] || stat}</h3>
              <div className="text-xl font-bold">{value} <span className="text-sm font-normal">({getModifier(value)})</span></div>
            </div>
            
            {/* Кнопка для индивидуального броска */}
            {onRollSingleAbility && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSingleRoll(stat)}
                disabled={isRollingInProgress}
                className="w-full mb-2 bg-black/60 hover:bg-primary/20 border-primary/30"
              >
                <Dices className="mr-2 h-4 w-4" />
                Бросить кубики для {abilityNames[stat]}
              </Button>
            )}
            
            {/* Отображение набора кубиков для выбора */}
            <ScrollArea className="h-24 rounded-md border border-gray-700 bg-black/70 p-2">
              <div className="space-y-2">
                {diceResults && diceResults.map((dice, diceIndex) => {
                  const isAssigned = Object.values(assignedDice).includes(diceIndex);
                  const isAssignedToThisStat = assignedDice[stat] === diceIndex;
                  
                  // Проверяем, что dice существует и является массивом
                  if (!dice || !Array.isArray(dice)) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={diceIndex}
                      onClick={() => !isAssigned && onAssignDiceToStat(stat, diceIndex)}
                      className={`
                        flex justify-between items-center p-2 rounded cursor-pointer
                        ${isAssignedToThisStat ? 'bg-primary/30 border border-primary' : isAssigned ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-800 hover:bg-gray-700'}
                      `}
                    >
                      <div className="flex gap-1">
                        {dice.map((d, i) => (
                          <span 
                            key={i} 
                            className={`
                              inline-block w-6 h-6 text-center rounded border 
                              ${i === dice.indexOf(Math.min(...dice)) ? 'line-through text-gray-500 border-gray-700' : 'border-primary/30'}
                            `}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <span className="font-bold">
                        {getDiceTotal(dice)}
                      </span>
                    </div>
                  );
                })}
                
                {(!diceResults || diceResults.length === 0) && (
                  <div className="text-center text-gray-500 py-2">
                    Нажмите "Бросить кубики" для генерации значений
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbilityRollingPanel;
