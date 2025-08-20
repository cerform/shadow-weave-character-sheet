// src/pages/IntegratedBattlePage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BattleMap3D } from '@/components/battle/ui';
import { IntegratedCombatSystem } from '@/components/battle/IntegratedCombatSystem';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Swords, Dice6, Settings } from 'lucide-react';

export default function IntegratedBattlePage() {
  const [activeTab, setActiveTab] = useState<'map' | 'combat'>('map');
  const [diceModalOpen, setDiceModalOpen] = useState(false);

  const handleDiceRoll = (formula: string, reason?: string, playerName?: string) => {
    console.log('Dice roll:', { formula, reason, playerName });
  };

  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">Интегрированная боевая система D&D 5e</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiceModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Dice6 className="w-4 h-4" />
              Бросить кубик
            </Button>
            
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList>
                <TabsTrigger value="map">
                  <Map className="w-4 h-4 mr-2" />
                  3D Карта
                </TabsTrigger>
                <TabsTrigger value="combat">
                  <Swords className="w-4 h-4 mr-2" />
                  Боевая система
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="w-full h-full pt-12">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full h-full">
          <TabsContent value="map" className="w-full h-full m-0">
            <BattleMap3D />
          </TabsContent>
          
          <TabsContent value="combat" className="w-full h-full m-0 p-4">
            <IntegratedCombatSystem />
          </TabsContent>
        </Tabs>
      </div>

      {/* Инструкция для пользователя */}
      <Card className="fixed bottom-4 left-4 w-80 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Как использовать</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div>• <strong>3D Карта:</strong> Добавьте токены и настройте поле боя</div>
          <div>• <strong>Боевая система:</strong> Управляйте боем по правилам D&D 5e</div>
          <div>• <strong>Автосинхронизация:</strong> Изменения автоматически синхронизируются</div>
          <div>• <strong>Кубики:</strong> Встроенная система бросков с физикой</div>
        </CardContent>
      </Card>

      {/* Модальные окна */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName="ДМ"
      />
    </div>
  );
}