
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

  // Определяем максимальное количество заклинаний для каждого класса в соответствии с PHB
  const getMaxSpellsCount = (): number => {
    if (!character.class) return 0;
    
    const classLevel = character.level || 1;
    
    // Данные согласно PHB (Player's Handbook)
    switch (character.class) {
      case "Паладин":
        // Паладины получают заклинания со 2-го уровня
        if (classLevel < 2) return 0;
        // Половина уровня + модификатор Харизмы (минимум 1)
        const chaModifier = Math.max(0, Math.floor((character.abilities?.charisma || 10) - 10) / 2);
        return Math.max(1, Math.floor(classLevel / 2) + chaModifier);
      
      case "Следопыт":
        // Следопыты получают заклинания со 2-го уровня
        if (classLevel < 2) return 0;
        // Половина уровня + модификатор Мудрости (минимум 1)
        const wisModifier = Math.max(0, Math.floor((character.abilities?.wisdom || 10) - 10) / 2);
        return Math.max(1, Math.floor(classLevel / 2) + wisModifier);
      
      case "Бард":
        // Известные заклинания для барда по уровням
        const bardSpellsByLevel = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
        return bardSpellsByLevel[classLevel] || 0;
      
      case "Колдун":
        // Известные заклинания для колдуна по уровням
        const warlockSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
        return warlockSpellsByLevel[classLevel] || 0;
      
      case "Чародей":
        // Известные заклинания для чародея по уровням
        const sorcererSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
        return sorcererSpellsByLevel[classLevel] || 0;
      
      case "Волшебник":
        // Волшебники работают иначе - они записывают в книгу заклинаний
        // Базовое количество + 2 за каждый уровень
        return 6 + (classLevel - 1) * 2;
      
      case "Жрец":
      case "Друид":
        // Жрецы и Друиды готовят заклинания: уровень + модификатор основной характеристики
        const mainModifier = character.class === "Жрец" 
          ? Math.max(0, Math.floor((character.abilities?.wisdom || 10) - 10) / 2)
          : Math.max(0, Math.floor((character.abilities?.wisdom || 10) - 10) / 2);
        return classLevel + mainModifier;
      
      default:
        return 0;
    }
  };

  // Получение количества доступных заговоров
  const getMaxCantripsCount = (): number => {
    if (!character.class) return 0;
    
    const classLevel = character.level || 1;
    
    switch (character.class) {
      case "Бард":
        // Заговоры для барда: 2 на 1 уровне, +1 на 10-м уровне
        return classLevel >= 10 ? 3 : 2;
      
      case "Жрец":
        // Заговоры для жреца: 3 на 1 уровне, +1 на 4-м и 10-м уровнях
        if (classLevel >= 10) return 5;
        if (classLevel >= 4) return 4;
        return 3;
      
      case "Друид":
        // Заговоры для друида: 2 на 1 уровне, +1 на 4-м и 10-м уровнях
        if (classLevel >= 10) return 4;
        if (classLevel >= 4) return 3;
        return 2;
      
      case "Волшебник":
        // Заговоры для волшебника: 3 на 1 уровне, +1 на 4-м и 10-м уровнях
        if (classLevel >= 10) return 5;
        if (classLevel >= 4) return 4;
        return 3;
      
      case "Чародей":
        // Заговоры для чародея: 4 на 1 уровне, +1 на 4-м и 10-м уровнях
        if (classLevel >= 10) return 6;
        if (classLevel >= 4) return 5;
        return 4;
      
      case "Колдун":
        // Заговоры для колдуна: 2 на 1 уровне, +1 на 4-м и 10-м уровнях
        if (classLevel >= 10) return 4;
        if (classLevel >= 4) return 3;
        return 2;
      
      case "Паладин":
        // Паладины не получают заговоры
        return 0;
      
      case "Следопыт":
        // Следопыты не получают заговоры
        return 0;
      
      default:
        return 0;
    }
  };

  const getAvailableSpellLevels = () => {
    // Каждый класс имеет доступ к разным уровням заклинаний в зависимости от своего уровня
    const characterLevel = character.level || 1;
    
    switch (character.class) {
      case "Волшебник":
      case "Жрец":
      case "Друид":
      case "Бард":
      case "Чародей":
        // Полные заклинатели
        if (characterLevel >= 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (characterLevel >= 15) return [0, 1, 2, 3, 4, 5, 6, 7, 8];
        if (characterLevel >= 13) return [0, 1, 2, 3, 4, 5, 6, 7];
        if (characterLevel >= 11) return [0, 1, 2, 3, 4, 5, 6];
        if (characterLevel >= 9) return [0, 1, 2, 3, 4, 5];
        if (characterLevel >= 7) return [0, 1, 2, 3, 4];
        if (characterLevel >= 5) return [0, 1, 2, 3];
        if (characterLevel >= 3) return [0, 1, 2];
        return [0, 1];
      
      case "Колдун":
        // Колдун получает меньше ячеек, но все высшего уровня
        if (characterLevel >= 17) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (characterLevel >= 15) return [0, 1, 2, 3, 4, 5, 6, 7, 8];
        if (characterLevel >= 13) return [0, 1, 2, 3, 4, 5, 6, 7];
        if (characterLevel >= 11) return [0, 1, 2, 3, 4, 5];
        if (characterLevel >= 9) return [0, 1, 2, 3, 4, 5];
        if (characterLevel >= 7) return [0, 1, 2, 3, 4];
        if (characterLevel >= 5) return [0, 1, 2, 3];
        if (characterLevel >= 3) return [0, 1, 2];
        return [0, 1];
      
      case "Паладин":
      case "Следопыт":
        // Полузаклинатели
        if (characterLevel >= 17) return [0, 1, 2, 3, 4, 5];
        if (characterLevel >= 13) return [0, 1, 2, 3, 4];
        if (characterLevel >= 9) return [0, 1, 2, 3];
        if (characterLevel >= 5) return [0, 1, 2];
        if (characterLevel >= 2) return [0, 1]; // Заклинания с 2-го уровня
        return [0]; // Только заговоры на 1-м уровне (которых у них нет по PHB)
      
      default:
        return [0];
    }
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
      // Проверяем лимит заклинаний по уровню
      const isCantrip = spell.level === 0;
      const selectedCantripsCount = selectedSpells.filter(s => s.level === 0).length;
      const selectedRegularSpellsCount = selectedSpells.filter(s => s.level > 0).length;
      
      const maxCantrips = getMaxCantripsCount();
      const maxRegularSpells = getMaxSpellsCount() - getMaxCantripsCount(); // Общее минус заговоры
      
      if ((isCantrip && selectedCantripsCount < maxCantrips) || 
          (!isCantrip && selectedRegularSpellsCount < maxRegularSpells)) {
        setSelectedSpells([...selectedSpells, spell]);
      } else {
        // Можно добавить оповещение о том, что достигнут лимит заклинаний
        alert(isCantrip 
          ? `Вы не можете выбрать больше ${maxCantrips} заговоров` 
          : `Вы не можете выбрать больше ${maxRegularSpells} заклинаний`);
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
  const maxCantrips = getMaxCantripsCount();
  const maxRegularSpells = Math.max(0, getMaxSpellsCount() - maxCantrips); // Не допускаем отрицательные значения
  
  // Разделяем выбранные заклинания на заговоры и обычные заклинания
  const selectedCantrips = selectedSpells.filter(s => s.level === 0);
  const selectedRegularSpells = selectedSpells.filter(s => s.level > 0);
  
  const shouldDisableNext = character.class && getMaxSpellsCount() > 0 && selectedSpells.length === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Выбор заклинаний</h2>
      
      <div className="flex justify-between items-center bg-black/60 p-3 rounded-lg border border-primary/30 mb-4">
        <div>
          <Label className="text-white">Класс: {character.class}</Label>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge 
            style={{backgroundColor: currentTheme.accent}}
            className="text-white font-medium"
          >
            Выбрано заговоров: {selectedCantrips.length} / {maxCantrips}
          </Badge>
          <Badge 
            style={{backgroundColor: currentTheme.accent}}
            className="text-white font-medium"
          >
            Выбрано заклинаний: {selectedRegularSpells.length} / {maxRegularSpells}
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
