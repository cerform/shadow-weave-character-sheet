
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { Check, X, Trash2 } from 'lucide-react';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Badge } from '@/components/ui/badge';

interface Props {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<Props> = ({ character, updateCharacter, nextStep, prevStep }) => {
  // Преобразуем массив строк или массив объектов в массив объектов CharacterSpell
  const normalizeSpells = (spells: any[] | undefined): CharacterSpell[] => {
    if (!spells || spells.length === 0) return [];
    
    return spells.map(spell => {
      // Если spell уже объект с именем, возвращаем его
      if (typeof spell === 'object' && spell.name) {
        return spell;
      }
      // Если spell - строка (имя заклинания), конвертируем в объект
      if (typeof spell === 'string') {
        const spellDetails = getSpellsByName(spell);
        return spellDetails || { 
          name: spell, 
          level: 0, 
          school: "Неизвестная", 
          castingTime: "-", 
          range: "-", 
          components: "-", 
          duration: "-",
          description: "Нет описания"
        };
      }
      // Если ничего не подходит, возвращаем заглушку
      return { 
        name: "Неизвестное заклинание", 
        level: 0, 
        school: "Неизвестная", 
        castingTime: "-", 
        range: "-", 
        components: "-", 
        duration: "-",
        description: "Нет описания"
      };
    });
  };
  
  // Вспомогательная функция для получения детальной информации о заклинании по имени
  const getSpellsByName = (spellName: string): CharacterSpell | null => {
    const allClassSpells = getSpellsByClass(character.class);
    return allClassSpells.find(spell => spell.name === spellName) || null;
  };

  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(normalizeSpells(character.spells));
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [activeTab, setActiveTab] = useState<string>("0");
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Определяем максимальное количество заклинаний, которые может выбрать персонаж
  const getMaxSpellsCount = () => {
    // Это примерные цифры, их нужно адаптировать под правила D&D 5e
    const classSpellCounts: Record<string, number> = {
      "Волшебник": 6 + Math.max(0, Math.floor((character.abilityScores?.intelligence || 10) - 10) / 2),
      "Жрец": 4 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2),
      "Друид": 4 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2),
      "Бард": 4 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Колдун": 2 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Паладин": 2 + Math.max(0, Math.floor((character.abilityScores?.charisma || 10) - 10) / 2),
      "Следопыт": 2 + Math.max(0, Math.floor((character.abilityScores?.wisdom || 10) - 10) / 2)
    };
    
    return classSpellCounts[character.class] || 0;
  };

  const getAvailableSpellLevels = () => {
    // Каждый класс имеет доступ к разным уровням заклинаний в зависимости от своего уровня
    const characterLevel = character.level || 1;
    
    // Примерные значения, нужно будет адаптировать под правила D&D 5e
    if (characterLevel >= 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (characterLevel >= 13) return [0, 1, 2, 3, 4, 5, 6, 7];
    if (characterLevel >= 9) return [0, 1, 2, 3, 4, 5];
    if (characterLevel >= 5) return [0, 1, 2, 3];
    if (characterLevel >= 3) return [0, 1, 2];
    return [0, 1];
  };

  useEffect(() => {
    if (character.class) {
      // Получаем заклинания для класса персонажа
      const classSpells = getSpellsByClass(character.class);
      // Фильтруем по доступным уровням
      const availableLevels = getAvailableSpellLevels();
      const filteredSpells = classSpells.filter(spell => 
        spell && availableLevels.includes(spell.level || 0)
      );
      
      setAvailableSpells(filteredSpells);
    }
  }, [character.class, character.level]);

  const handleSelectSpell = (spell: CharacterSpell) => {
    if (selectedSpells.some(s => s.name === spell.name)) {
      // Если заклинание уже выбрано, удаляем его
      setSelectedSpells(selectedSpells.filter(s => s.name !== spell.name));
    } else {
      // Проверяем лимит заклинаний
      if (selectedSpells.length < getMaxSpellsCount()) {
        setSelectedSpells([...selectedSpells, spell]);
      } else {
        // Можно добавить оповещение о том, что достигнут лимит заклинаний
        alert(`Вы не можете выбрать больше ${getMaxSpellsCount()} заклинаний`);
      }
    }
  };

  const handleSaveSpells = () => {
    // Сохраняем только имена заклинаний, чтобы избежать проблемы с рендерингом объектов
    const spellNames = selectedSpells.map(spell => spell.name);
    updateCharacter({
      spells: spellNames
    });
    nextStep();
  };

  const removeSpell = (spellName: string) => {
    setSelectedSpells(selectedSpells.filter(s => s.name !== spellName));
  };

  const spellLevels = getAvailableSpellLevels();
  const shouldDisableNext = character.class && getMaxSpellsCount() > 0 && selectedSpells.length === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Выбор заклинаний</h2>
      
      <div className="flex justify-between items-center bg-black/60 p-3 rounded-lg border border-primary/30 mb-4">
        <div>
          <Label className="text-white">Класс: {character.class}</Label>
        </div>
        <div>
          <Badge 
            style={{backgroundColor: currentTheme.accent}}
            className="text-white font-medium"
          >
            Выбрано заклинаний: {selectedSpells.length} / {getMaxSpellsCount()}
          </Badge>
        </div>
      </div>
      
      {/* Блок выбранных заклинаний */}
      {selectedSpells.length > 0 && (
        <Card className="border border-primary/30 bg-black/60 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              Выбранные заклинания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedSpells.map((spell, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-primary/10 p-2 rounded-md border border-primary/30"
                  style={{ boxShadow: `0 0 5px ${currentTheme.accent}40` }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{spell.name}</span>
                    <span className="text-xs opacity-70">{spell.school || ''} • {spell.level ? `Уровень ${spell.level}` : 'Заговор'}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSpell(spell.name)}
                    className="hover:bg-red-500/20 hover:text-red-400 p-1 h-auto"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-black/40">
          {spellLevels.map(level => (
            <TabsTrigger 
              key={level} 
              value={level.toString()}
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {level === 0 ? "Заговоры" : `Уровень ${level}`}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {spellLevels.map(level => (
          <TabsContent key={level} value={level.toString()}>
            <Card className="border-primary/20 bg-black/60">
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 gap-2">
                    {availableSpells
                      .filter(spell => spell && spell.level === level)
                      .map((spell, index) => {
                        const isSelected = selectedSpells.some(s => s.name === spell.name);
                        return (
                          <Button 
                            key={index}
                            variant={isSelected ? "default" : "outline"}
                            className={`justify-start text-left h-auto py-3 relative ${isSelected ? 'border-white' : 'border-primary/30'}`}
                            onClick={() => handleSelectSpell(spell)}
                            style={{
                              backgroundColor: isSelected ? `${currentTheme.accent}80` : 'rgba(0, 0, 0, 0.6)',
                              boxShadow: isSelected ? `0 0 10px ${currentTheme.accent}80` : 'none'
                            }}
                          >
                            <div className="flex-1">
                              <div className="font-bold text-white">{spell.name}</div>
                              <div className="text-sm opacity-80 text-white">{spell.school} • {spell.castingTime}</div>
                            </div>
                            {isSelected && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Check size={20} className="text-white" />
                              </div>
                            )}
                          </Button>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleSaveSpells}
        nextLabel="Далее: Снаряжение"
        disableNext={shouldDisableNext}
        allowNext={!shouldDisableNext}
      />
    </div>
  );
};

export default CharacterSpellSelection;
