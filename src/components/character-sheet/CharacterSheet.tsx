
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from './CharacterHeader';
import { StatsPanel } from './StatsPanel';
import { ResourcePanel } from './ResourcePanel';
import { CharacterTabs } from './CharacterTabs';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSelector } from './ThemeSelector';
import { DicePanel } from './DicePanel';
import { Save, Printer } from 'lucide-react';

interface CharacterSheetProps {
  character?: any;
}

const CharacterSheet = ({ character }: CharacterSheetProps) => {
  const { theme, setTheme } = useTheme();
  const [currentHp, setCurrentHp] = useState(character?.hp || 20);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 20);
  const [characterName, setCharacterName] = useState(character?.name || 'Новый персонаж');
  const [characterClass, setCharacterClass] = useState(character?.class || 'Выберите класс');
  const [activeTab, setActiveTab] = useState('abilities');

  const handleSaveCharacter = () => {
    // TODO: Implement save functionality
    console.log('Saving character...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-center bg-card/30 backdrop-blur-sm border-primary/20 rounded-lg p-4">
          <h1 className="text-2xl font-bold">{characterName} — {characterClass}</h1>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button onClick={handleSaveCharacter} variant="outline" className="gap-2">
              <Save className="size-4" />
              Сохранить
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="size-4" />
              Печать
            </Button>
            <ThemeSelector />
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
          <div className="space-y-4">
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <Button className="w-full">Изменить аватар</Button>
            </Card>
            
            <ResourcePanel 
              currentHp={currentHp}
              maxHp={maxHp}
              onHpChange={setCurrentHp}
            />
            
            <DicePanel />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Инвентарь</h3>
              <textarea 
                className="w-full h-32 bg-background/50 border border-input rounded-md p-2 resize-none"
                placeholder="Список предметов..."
              />
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Отдых</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline">Короткий отдых</Button>
                <Button>Длинный отдых</Button>
              </div>
            </Card>
          </div>
          
          <div className="flex flex-col space-y-4">
            <CharacterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          <div className="space-y-4">
            <StatsPanel />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Навыки</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Акробатика</span>
                  <span>+2</span>
                </div>
                <div className="flex justify-between">
                  <span>Атлетика</span>
                  <span>+0</span>
                </div>
                <div className="flex justify-between">
                  <span>Магия</span>
                  <span>+3</span>
                </div>
                <div className="flex justify-between">
                  <span>История</span>
                  <span>+3</span>
                </div>
                <div className="flex justify-between">
                  <span>Восприятие</span>
                  <span>-1</span>
                </div>
                <div className="flex justify-between">
                  <span>Скрытность</span>
                  <span>+2</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Особенности</h3>
              <div className="h-48 overflow-y-auto space-y-2 pr-2">
                <div className="p-2 rounded-md bg-primary/5 hover:bg-primary/10">
                  <h4 className="font-medium">Внезапная атака</h4>
                  <p className="text-sm text-muted-foreground">Дополнительные 1d6 урона, если у вас преимущество на бросок атаки.</p>
                </div>
                <div className="p-2 rounded-md bg-primary/5 hover:bg-primary/10">
                  <h4 className="font-medium">Экспертиза</h4>
                  <p className="text-sm text-muted-foreground">Удваивает бонус мастерства для двух навыков.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
