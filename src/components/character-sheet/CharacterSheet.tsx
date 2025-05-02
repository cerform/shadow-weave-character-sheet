
import React, { useState, useContext } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from './CharacterHeader';
import { StatsPanel } from './StatsPanel';
import { ResourcePanel } from './ResourcePanel';
import { CharacterTabs } from './CharacterTabs';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { Save, Printer, Book, User2, AlertTriangle, Sword, MapPin, Shield } from 'lucide-react';
import { SpellPanel } from './SpellPanel';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/hooks/use-toast";
import { RestPanel } from './RestPanel';
import { Progress } from "@/components/ui/progress";

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
  const [battleMapVisible, setBattleMapVisible] = useState(false);

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
  
  const toggleBattleMap = () => {
    setBattleMapVisible(!battleMapVisible);
  };

  // Функция для расчета опыта до следующего уровня
  const calculateLevelProgress = () => {
    const currentLevel = character?.level || 1;
    
    // Таблица опыта по уровням D&D 5e
    const xpTable = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    // Если персонаж максимального уровня, возвращаем 100%
    if (currentLevel >= 20) {
      return 100;
    }
    
    // Считаем, что у персонажа сейчас ровно минимальный опыт для текущего уровня
    const currentXP = character?.xp || xpTable[currentLevel - 1];
    
    // Расчет прогресса до следующего уровня
    const xpForCurrentLevel = xpTable[currentLevel - 1];
    const xpForNextLevel = xpTable[currentLevel];
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const currentProgress = currentXP - xpForCurrentLevel;
    
    return Math.min(100, Math.max(0, Math.floor((currentProgress / xpNeeded) * 100)));
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
        
        {/* Главный блок "Магия Теней" - увеличенный */}
        <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl font-bold text-primary">Магия Теней</div>
            <div className="flex gap-2">
              <Button onClick={toggleBattleMap} variant="outline" size="sm" className="gap-1">
                <MapPin className="size-4" />
                {battleMapVisible ? "Скрыть карту" : "Показать карту"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Sword className="size-4" />
                Начать бой
              </Button>
            </div>
          </div>
          
          {/* Область для боевой карты - увеличенная */}
          <div className={`transition-all duration-300 ${battleMapVisible ? 'h-[500px]' : 'h-[300px]'} bg-black/30 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden`}>
            {!battleMapVisible ? (
              <div className="text-center text-primary/80 p-6">
                <div className="text-2xl font-semibold mb-3">Область визуализации</div>
                <p className="max-w-2xl mx-auto">
                  Здесь будет отображаться карта боя, визуализация заклинаний и ключевых сцен.
                  Мастер подземелий управляет содержимым этой области.
                </p>
              </div>
            ) : (
              <>
                {/* Имитация поля боя */}
                <div className="absolute inset-0 grid grid-cols-20 grid-rows-15 opacity-20">
                  {Array.from({ length: 300 }).map((_, i) => (
                    <div key={i} className="border border-primary/50"></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-primary/80">
                    <p className="text-lg">Ожидание действий Мастера...</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Панель быстрого доступа к действиям */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              <Sword className="size-4" /> Атака
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              <Shield className="size-4" /> Защита
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Заклинание
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Движение
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Предмет
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Бонусное
            </Button>
          </div>
        </Card>
        
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
            
            {/* Блок с прогрессом персонажа */}
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Прогресс</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-primary/70">Уровень {character.level}</span>
                    <span className="text-sm text-primary/70">Уровень {Math.min(20, character.level + 1)}</span>
                  </div>
                  <Progress value={calculateLevelProgress()} className="h-2" />
                  <div className="mt-1 text-xs text-center text-primary/60">
                    {calculateLevelProgress()}% до следующего уровня
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <User2 className="h-4 w-4" /> Класс
                  </span>
                  <span className="font-medium text-primary">
                    {character.className} {character.subclass ? `(${character.subclass})` : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <Book className="h-4 w-4" /> Предыстория
                  </span>
                  <span className="font-medium text-primary">
                    {character.background || 'Не указано'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Мировоззрение
                  </span>
                  <span className="font-medium text-primary">
                    {character.alignment || 'Нейтральный'}
                  </span>
                </div>
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
            
            {activeTab === 'combat' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Боевые характеристики</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">КЗ</div>
                      <div className="text-2xl font-bold text-primary">{character.ac || 10}</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">Инициатива</div>
                      <div className="text-2xl font-bold text-primary">+{character.initiative || 0}</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">Скорость</div>
                      <div className="text-2xl font-bold text-primary">{character.speed || 30} футов</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mt-4">Оружие и атаки</h3>
                  <div className="space-y-3">
                    {character.weapons ? (
                      character.weapons.map((weapon: any, idx: number) => (
                        <div key={idx} className="p-3 bg-primary/5 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">{weapon.name}</span>
                            <span className="text-primary">+{weapon.attackBonus} к атаке</span>
                          </div>
                          <div className="text-sm text-primary/70 mt-1">
                            Урон: {weapon.damage} ({weapon.damageType})
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-primary/50">
                        <p>Нет доступного оружия</p>
                      </div>
                    )}
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
