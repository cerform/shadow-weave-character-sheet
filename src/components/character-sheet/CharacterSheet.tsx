
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from './CharacterHeader';
import { StatsPanel } from './StatsPanel';
import { ResourcePanel } from './ResourcePanel';
import { CharacterTabs } from './CharacterTabs';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { Save, Printer } from 'lucide-react';
import { DiceRoller3D } from './DiceRoller3D';
import { SpellPanel } from './SpellPanel';

interface CharacterSheetProps {
  character?: any;
}

const CharacterSheet = ({ character }: CharacterSheetProps) => {
  const { theme } = useTheme();
  const [currentHp, setCurrentHp] = useState(character?.hp || 20);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 20);
  const [characterName, setCharacterName] = useState(character?.name || 'Новый персонаж');
  const [characterClass, setCharacterClass] = useState(character?.class || 'Выберите класс');
  const [activeTab, setActiveTab] = useState('abilities');

  // Use default values for character if it's not provided
  const characterData = character || {
    name: characterName,
    class: characterClass,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    }
  };

  const handleSaveCharacter = () => {
    // TODO: Implement save functionality
    console.log('Saving character...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-[1400px] mx-auto">
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
          {/* Left sidebar */}
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
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 h-[250px]">
              <h3 className="text-lg font-semibold mb-2">Кубики</h3>
              <DiceRoller3D />
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Ресурсы</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ячейки заклинаний 1 уровня</span>
                  <span>3/4</span>
                </div>
                <div className="flex justify-between">
                  <span>Ячейки заклинаний 2 уровня</span>
                  <span>2/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Sorcery Points</span>
                  <span>3/5</span>
                </div>
              </div>
            </Card>
            
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
          
          {/* Center content */}
          <div className="flex flex-col space-y-4">
            <CharacterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'spells' && (
              <SpellPanel />
            )}
            
            {activeTab === 'abilities' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-4xl font-bold text-primary mb-4">Магия Теней</div>
                  <p className="text-center max-w-md">
                    Визуализация заклинаний, битв и ключевых сцен будет отображаться здесь.
                    В этой области будут происходить интерактивные события во время игры.
                  </p>
                </div>
              </Card>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-4">
            <StatsPanel character={characterData} />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Навыки</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Акробатика</span>
                  <span className="text-green-400">+3</span>
                </div>
                <div className="flex justify-between">
                  <span>Атлетика</span>
                  <span>+0</span>
                </div>
                <div className="flex justify-between">
                  <span>Магия</span>
                  <span className="text-green-400">+3</span>
                </div>
                <div className="flex justify-between">
                  <span>История</span>
                  <span>+1</span>
                </div>
                <div className="flex justify-between">
                  <span>Восприятие</span>
                  <span>-1</span>
                </div>
                <div className="flex justify-between">
                  <span>Скрытность</span>
                  <span className="text-green-400">+2</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Характеристики</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">СИЛ</div>
                  <div className="text-xl">10 <span className="text-xs opacity-60">(+0)</span></div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">ЛОВ</div>
                  <div className="text-xl">16 <span className="text-xs text-green-400">(+3)</span></div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">ТЕЛ</div>
                  <div className="text-xl">14 <span className="text-xs text-green-400">(+2)</span></div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">ИНТ</div>
                  <div className="text-xl">12 <span className="text-xs text-green-400">(+1)</span></div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">МДР</div>
                  <div className="text-xl">10 <span className="text-xs opacity-60">(+0)</span></div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <div className="text-sm opacity-70 mb-1">ХАР</div>
                  <div className="text-xl">17 <span className="text-xs text-green-400">(+3)</span></div>
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
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Информация</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Раса:</span>
                  <span>Человек (Вариант)</span>
                </div>
                <div className="flex justify-between">
                  <span>Класс:</span>
                  <span>Колдун (Сделка с Тенью)</span>
                </div>
                <div className="flex justify-between">
                  <span>Уровень:</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between">
                  <span>Опыт:</span>
                  <span>900 XP</span>
                </div>
                <div className="flex justify-between">
                  <span>Мировоззрение:</span>
                  <span>Хаотично-нейтральный</span>
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
