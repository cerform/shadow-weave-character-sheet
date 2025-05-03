
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GradientDice from './GradientDice';

const DiceTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('d20');
  const [rolling, setRolling] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  
  // Цветовые схемы для разных кубиков
  const diceColors = {
    'd4': { color1: "#9b87f5", color2: "#d946ef" },
    'd6': { color1: "#0ea5e9", color2: "#3b82f6" },
    'd8': { color1: "#10b981", color2: "#059669" },
    'd10': { color1: "#f59e0b", color2: "#d97706" },
    'd12': { color1: "#ef4444", color2: "#b91c1c" },
    'd20': { color1: "#8b5cf6", color2: "#7c3aed" }
  };
  
  const handleRoll = () => {
    if (rolling) return;
    
    setRolling(true);
    setResult(null);
    
    // Генерируем случайный результат в зависимости от типа кубика
    const max = parseInt(activeTab.substring(1));
    
    setTimeout(() => {
      const newResult = Math.floor(Math.random() * max) + 1;
      setResult(newResult);
      setRolling(false);
    }, 1000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Тестер градиентных кубиков</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="d20" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setResult(null);
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="d4">d4</TabsTrigger>
            <TabsTrigger value="d6">d6</TabsTrigger>
            <TabsTrigger value="d8">d8</TabsTrigger>
            <TabsTrigger value="d10">d10</TabsTrigger>
            <TabsTrigger value="d12">d12</TabsTrigger>
            <TabsTrigger value="d20">d20</TabsTrigger>
          </TabsList>
          
          {Object.keys(diceColors).map((diceType) => (
            <TabsContent key={diceType} value={diceType} className="p-4 flex justify-center">
              <div className="h-[200px] w-[200px]">
                <GradientDice 
                  diceType={diceType as 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'}
                  rolling={rolling}
                  result={result}
                  showNumber={!!result}
                  color1={diceColors[diceType as keyof typeof diceColors].color1}
                  color2={diceColors[diceType as keyof typeof diceColors].color2}
                  size={200}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={handleRoll}
          disabled={rolling}
          className="w-full"
        >
          {rolling ? 'Бросок...' : 'Бросить кубик'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiceTester;
