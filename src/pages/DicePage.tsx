
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { Dices } from 'lucide-react';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { toast } from 'sonner';
import HomeButton from '@/components/navigation/HomeButton';

interface DiceResult {
  type: string;
  value: number;
  rolls?: number[];
}

const DicePage: React.FC = () => {
  const [results, setResults] = useState<DiceResult[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  const rollDice = (sides: number, count: number = 1) => {
    const rolls: number[] = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    const result: DiceResult = {
      type: `${count}d${sides}`,
      value: total,
      rolls: count > 1 ? rolls : undefined
    };
    
    setResults(prev => [result, ...prev].slice(0, 20)); // Сохраняем только 20 последних результатов
    toast.success(`Выпало ${result.value} на ${result.type}`);
  };

  const clearHistory = () => {
    setResults([]);
    toast('История очищена');
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Dices className="h-8 w-8" /> Виртуальные кубики
            </h1>
            <IconOnlyNavigation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Левая колонка - Панель кубиков */}
            <div className="md:col-span-8 space-y-6">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader>
                  <CardTitle>Бросок кубиков</CardTitle>
                  <CardDescription>Выберите тип кубика для броска</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                      <Button 
                        key={sides} 
                        className="h-20 w-full flex flex-col items-center justify-center bg-primary/80 hover:bg-primary"
                        onClick={() => rollDice(sides)}
                      >
                        <span className="text-lg font-bold">d{sides}</span>
                        <span className="text-xs opacity-80">Бросить</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">Комбинированные броски</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(6, 2)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">2d6</span>
                        <span className="text-xs opacity-80">Два шестигранника</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(6, 3)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">3d6</span>
                        <span className="text-xs opacity-80">Три шестигранника</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(20, 2)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">2d20</span>
                        <span className="text-xs opacity-80">Два d20</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(8, 2)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">2d8</span>
                        <span className="text-xs opacity-80">Два d8</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(10, 2)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">2d10</span>
                        <span className="text-xs opacity-80">Два d10</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => rollDice(4, 4)}
                        className="flex flex-col h-16"
                      >
                        <span className="font-semibold">4d4</span>
                        <span className="text-xs opacity-80">Четыре d4</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка - История бросков */}
            <div className="md:col-span-4">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>История бросков</CardTitle>
                    <CardDescription>Последние результаты</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? 'Скрыть' : 'Показать'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {showHistory && (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {results.length > 0 ? (
                        results.map((result, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center border-b border-accent/20 pb-2"
                          >
                            <div>
                              <span className="text-sm opacity-70">{result.type}:</span>
                              <span className="ml-2 font-bold text-lg">{result.value}</span>
                            </div>
                            {result.rolls && (
                              <div className="text-xs opacity-70">
                                {result.rolls.join(' + ')}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Нет истории бросков
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearHistory}
                    disabled={results.length === 0}
                  >
                    Очистить историю
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-4 flex justify-center">
                <HomeButton variant="default" showText={true} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default DicePage;
