
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from '@/components/character-sheet/CharacterHeader';
import { StatsPanel } from '@/components/character-sheet/StatsPanel';
import { ResourcePanel } from '@/components/character-sheet/ResourcePanel';
import { CharacterTabs } from '@/components/character-sheet/CharacterTabs';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSelector } from '@/components/character-sheet/ThemeSelector';
import { DicePanel } from '@/components/character-sheet/DicePanel';
import { Save, Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Character {
  name?: string;
  class?: string;
  race?: string;
  subrace?: string;
  level?: number;
  background?: string;
  alignment?: string;
  abilities?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  [key: string]: any;
}

const CharacterSheetPage = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const character: Character = state?.character || {};

  const [currentHp, setCurrentHp] = React.useState(20);
  const [maxHp, setMaxHp] = React.useState(20);
  const [activeTab, setActiveTab] = React.useState('abilities');

  // Calculate ability modifiers
  const getAbilityModifier = (value: number): string => {
    const modifier = Math.floor((value - 10) / 2);
    if (modifier >= 0) return `+${modifier}`;
    return `${modifier}`;
  };

  const handleSaveCharacter = () => {
    toast.success('Персонаж сохранен');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToCreate = () => {
    navigate('/create');
  };

  if (!character || Object.keys(character).length === 0) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Персонаж не найден</h2>
          <p className="mb-6">Похоже, вы пытаетесь просмотреть персонажа, который не был создан. Вернитесь к созданию персонажа.</p>
          <Button onClick={() => navigate('/create')}>Создать персонажа</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-center bg-card/30 backdrop-blur-sm border-primary/20 rounded-lg p-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBackToCreate} className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">{character.name || 'Новый персонаж'} — {character.class || 'Класс не выбран'}</h1>
          </div>
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
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Информация персонажа</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Раса:</span>
                  <span>{character.race} {character.subrace ? `(${character.subrace})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Класс:</span>
                  <span>{character.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Уровень:</span>
                  <span>{character.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Предыстория:</span>
                  <span>{character.background}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Мировоззрение:</span>
                  <span>{character.alignment}</span>
                </div>
              </div>
            </Card>
            
            <StatsPanel />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Характеристики</h3>
              <div className="space-y-2">
                {Object.entries(character.abilities || {}).map(([ability, value]) => (
                  <div key={ability} className="flex justify-between">
                    <span>{
                      ability === 'strength' ? 'Сила' : 
                      ability === 'dexterity' ? 'Ловкость' :
                      ability === 'constitution' ? 'Телосложение' :
                      ability === 'intelligence' ? 'Интеллект' :
                      ability === 'wisdom' ? 'Мудрость' : 'Харизма'
                    }</span>
                    <span>{value} ({getAbilityModifier(Number(value))})</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2">Навыки</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Акробатика</span>
                  <span>{getAbilityModifier(character.abilities?.dexterity || 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Атлетика</span>
                  <span>{getAbilityModifier(character.abilities?.strength || 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Магия</span>
                  <span>{getAbilityModifier(character.abilities?.intelligence || 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>История</span>
                  <span>{getAbilityModifier(character.abilities?.intelligence || 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Восприятие</span>
                  <span>{getAbilityModifier(character.abilities?.wisdom || 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Скрытность</span>
                  <span>{getAbilityModifier(character.abilities?.dexterity || 10)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetPage;
