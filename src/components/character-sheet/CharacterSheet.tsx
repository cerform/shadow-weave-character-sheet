
import React, { useState, useContext } from 'react';
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
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/components/ui/use-toast";
import { RestPanel } from './RestPanel';

interface CharacterSheetProps {
  character?: any;
}

const CharacterSheet = ({ character: propCharacter }: CharacterSheetProps) => {
  const { theme } = useTheme();
  const { character: contextCharacter, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  
  // Используем персонажа из пропсов, если он передан, иначе из контекста
  const character = propCharacter || contextCharacter;
  
  const [currentHp, setCurrentHp] = useState(character?.currentHp || character?.maxHp || 20);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 20);
  const [characterName, setCharacterName] = useState(character?.name || 'Новый персонаж');
  const [characterClass, setCharacterClass] = useState(character?.className || 'Выберите класс');
  const [activeTab, setActiveTab] = useState('abilities');

  // Обновляет HP персонажа в контексте при изменении в UI
  const handleHpChange = (newHp: number) => {
    setCurrentHp(newHp);
    
    if (contextCharacter) {
      updateCharacter({ currentHp: newHp });
    }
  };

  const handleSaveCharacter = () => {
    if (!contextCharacter) {
      toast({
        title: "Ошибка",
        description: "Нет персонажа для сохранения",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Персонаж сохранен",
      description: `${character.name} успешно сохранен`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!character) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Персонаж не выбран</h3>
          <p className="text-muted-foreground mb-4">Создайте нового персонажа или выберите существующего</p>
          <Button>Создать персонажа</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-center bg-card/30 backdrop-blur-sm border-primary/20 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-primary">{character.name} — {character.className}</h1>
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
              onHpChange={handleHpChange}
            />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Кубики</h3>
              <div className="h-[200px]">
                <DiceRoller3D />
              </div>
            </Card>
            
            <RestPanel />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Инвентарь</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.equipment && character.equipment.length > 0 ? (
                  character.equipment.map((item: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Нет предметов</p>
                )}
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
                  <p className="text-center max-w-md text-primary/80">
                    Визуализация заклинаний, битв и ключевых сцен будет отображаться здесь.
                    В этой области будут происходить интерактивные события во время игры.
                  </p>
                </div>
              </Card>
            )}
            
            {activeTab === 'combat' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Боевая сцена</h3>
                  <div className="h-96 bg-primary/5 rounded-lg flex items-center justify-center">
                    <p className="text-primary/70">Здесь будет отображаться боевая карта</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline">Атака</Button>
                    <Button variant="outline">Движение</Button>
                    <Button variant="outline">Заклинание</Button>
                    <Button variant="outline">Бонусное действие</Button>
                  </div>
                </div>
              </Card>
            )}
            
            {activeTab === 'background' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <h3 className="text-lg font-semibold text-primary mb-4">Предыстория</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-primary/90">{character.background || 'У этого персонажа пока нет предыстории.'}</p>
                </div>
              </Card>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-4">
            <StatsPanel character={character} />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Навыки</h3>
              <div className="space-y-2">
                {character.abilities && Object.entries(character.abilities).map(([ability, score]: [string, any]) => {
                  const mod = Math.floor((Number(score) - 10) / 2);
                  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                  
                  return (
                    <div key={ability} className="flex justify-between">
                      <span className="text-primary">{getAbilityName(ability)}</span>
                      <span className="text-primary">{score} ({modStr})</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Особенности</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.proficiencies && character.proficiencies.length > 0 ? (
                  character.proficiencies.map((prof: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {prof}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Нет особенностей</p>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Языки</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.languages && character.languages.length > 0 ? (
                  character.languages.map((lang: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {lang}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Общий</p>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Информация</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary/80">Раса:</span>
                  <span className="text-primary">{character.race} {character.subrace ? `(${character.subrace})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Класс:</span>
                  <span className="text-primary">{character.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Уровень:</span>
                  <span className="text-primary">{character.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Мировоззрение:</span>
                  <span className="text-primary">{character.alignment || 'Нейтральный'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Функция для получения названия характеристики
const getAbilityName = (abilityCode: string): string => {
  const names: Record<string, string> = {
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма'
  };
  
  return names[abilityCode] || abilityCode;
};

export default CharacterSheet;
