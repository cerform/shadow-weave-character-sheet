
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CharacterSpell } from '@/types/character';
import { SpellData, convertSpellDataToCharacterSpell, convertCharacterSpellToSpellData } from '@/types/spells';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import NavigationButtons from './NavigationButtons';
import { getAllSpells } from '@/data/spells';
import { calculateKnownSpells, getMaxSpellLevel } from '@/utils/spellUtils';

interface CharacterSpellSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const { toast } = useToast();
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(character.spells || []);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('cantrips');
  const [spellLimits, setSpellLimits] = useState<{ cantrips: number; spells: number }>({
    cantrips: 0,
    spells: 0,
  });

  // Основные магические классы
  const magicClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
    'Чародей', 'Паладин', 'Следопыт'
  ];

  // Получаем максимальный уровень заклинаний - передаем класс и уровень
  const maxSpellLevel = getMaxSpellLevel(character.class, character.level);

  // Проверка имеет ли персонаж доступ к заклинаниям
  const isMagicUser = () => {
    return magicClasses.includes(character.class);
  };

  // Получаем модификатор основной характеристики заклинателя
  const getSpellcasterModifier = () => {
    let ability = 'intelligence';
    
    switch (character.class.toLowerCase()) {
      case 'жрец':
      case 'cleric':
      case 'друид':
      case 'druid':
        ability = 'wisdom';
        break;
      case 'бард':
      case 'bard':
      case 'чародей':
      case 'sorcerer':
      case 'колдун':
      case 'warlock':
      case 'паладин':
      case 'paladin':
        ability = 'charisma';
        break;
      default:
        ability = 'intelligence';
    }
    
    // Получаем значение из abilities или stats
    let abilityScore = 10;
    if (character.abilities) {
      if (ability === 'intelligence' && character.abilities.INT !== undefined) {
        abilityScore = character.abilities.INT;
      } else if (ability === 'wisdom' && character.abilities.WIS !== undefined) {
        abilityScore = character.abilities.WIS;
      } else if (ability === 'charisma' && character.abilities.CHA !== undefined) {
        abilityScore = character.abilities.CHA;
      } else if (character.abilities[ability] !== undefined) {
        abilityScore = character.abilities[ability];
      }
    }
    
    return Math.floor((abilityScore - 10) / 2);
  };

  // Загружаем доступные заклинания
  useEffect(() => {
    if (!isMagicUser()) {
      nextStep(); // Пропускаем шаг, если класс не магический
      return;
    }
    
    try {
      // Получаем все заклинания из базы данных
      const allSpells = getAllSpells();
      
      // Фильтруем заклинания для конкретного класса и уровня
      const filteredSpells = allSpells.filter(spell => {
        // Проверяем, есть ли у заклинания поле classes
        if (!spell.classes) return false;
        
        const spellClasses = typeof spell.classes === 'string' 
          ? [spell.classes] 
          : Array.isArray(spell.classes) ? spell.classes : [];
        
        // Проверяем, что заклинание доступно для класса персонажа
        const isClassSpell = spellClasses.some(
          cls => cls.toLowerCase() === character.class.toLowerCase()
        );
        
        // Проверяем уровень заклинания
        const isLevelAllowed = spell.level <= maxSpellLevel;
        
        return isClassSpell && isLevelAllowed;
      });
      
      console.log(`Найдено ${filteredSpells.length} заклинаний для класса ${character.class}`);
      setAvailableSpells(filteredSpells);
    } catch (error) {
      console.error("Ошибка при загрузке заклинаний:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список доступных заклинаний.",
        variant: "destructive"
      });
    }
  }, [character.class, character.level, maxSpellLevel, nextStep]);

  // Рассчитываем лимиты заклинаний
  useEffect(() => {
    if (!isMagicUser()) return;
    
    const mod = getSpellcasterModifier();
    const { cantripsCount, knownSpells } = calculateKnownSpells(character.class, character.level, mod);
    
    setSpellLimits({
      cantrips: cantripsCount,
      spells: knownSpells
    });
    
    toast({
      title: "Информация о заклинаниях",
      description: `Вы можете выбрать ${cantripsCount} заговоров и ${knownSpells} заклинаний для вашего персонажа.`
    });
  }, [character.class, character.level]);

  // Подсчет выбранных заклинаний по типам
  const getSelectedSpellCount = () => {
    const cantrips = selectedSpells.filter(spell => spell.level === 0).length;
    const regularSpells = selectedSpells.filter(spell => spell.level > 0).length;
    
    return {
      cantrips,
      spells: regularSpells
    };
  };

  // Проверка, достигнут ли лимит для определенного уровня заклинаний
  const isLimitReached = (level: number) => {
    const counts = getSelectedSpellCount();
    
    if (level === 0) {
      return counts.cantrips >= spellLimits.cantrips;
    } else {
      return counts.spells >= spellLimits.spells;
    }
  };

  // Обработка выбора заклинания
  const toggleSpellSelection = (spell: SpellData) => {
    // Проверяем, выбрано ли уже заклинание
    const isSelected = selectedSpells.some(s => s.name === spell.name);
    
    if (isSelected) {
      // Удаляем заклинание из выбранных
      setSelectedSpells(selectedSpells.filter(s => s.name !== spell.name));
    } else {
      // Проверяем, не превышен ли лимит
      if (isLimitReached(spell.level)) {
        toast({
          title: "Лимит заклинаний достигнут",
          description: `Вы не можете выбрать больше ${spell.level === 0 ? spellLimits.cantrips + ' заговоров' : spellLimits.spells + ' заклинаний'}.`,
          variant: "destructive"
        });
        return;
      }
      
      // Преобразуем SpellData в CharacterSpell
      const newSpell: CharacterSpell = {
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        description: spell.description,
        classes: spell.classes,
        // Устанавливаем prepared в зависимости от класса
        prepared: character.class === 'Волшебник' || character.class === 'Жрец' || character.class === 'Друид' ? false : true,
        id: spell.id
      };
      
      setSelectedSpells([...selectedSpells, newSpell]);
    }
  };

  // Фильтрация заклинаний по тексту и уровню
  const filteredSpells = availableSpells.filter(spell => {
    const matchesText = filterText === '' || 
      spell.name.toLowerCase().includes(filterText.toLowerCase()) || 
      (spell.description && (
        typeof spell.description === 'string' 
          ? spell.description.toLowerCase().includes(filterText.toLowerCase())
          : spell.description.some(d => d.toLowerCase().includes(filterText.toLowerCase()))
      ));
    
    const matchesLevel = 
      (activeTab === 'cantrips' && spell.level === 0) || 
      (activeTab === 'level1' && spell.level === 1) ||
      (activeTab === 'level2' && spell.level === 2) ||
      (activeTab === 'level3plus' && spell.level >= 3 && spell.level <= maxSpellLevel);
    
    return matchesText && matchesLevel;
  });

  // Функция для отображения описания компонентов заклинания
  const formatComponents = (components: string) => {
    const parts = [];
    
    if (components.includes('В') || components.includes('V')) parts.push('Вербальный');
    if (components.includes('С') || components.includes('S')) parts.push('Соматический');
    if (components.includes('М') || components.includes('M')) {
      const match = components.match(/\(([^)]+)\)/);
      if (match) {
        parts.push(`Материальный (${match[1]})`);
      } else {
        parts.push('Материальный');
      }
    }
    
    return parts.join(', ');
  };

  // Обработка перехода к следующему шагу
  const handleNext = () => {
    // Проверяем, выбраны ли все заклинания в пределах лимита
    const counts = getSelectedSpellCount();
    const isCompleted = counts.cantrips <= spellLimits.cantrips && counts.spells <= spellLimits.spells;
    
    if (!isCompleted) {
      const cantripsNeeded = Math.max(0, spellLimits.cantrips - counts.cantrips);
      const spellsNeeded = Math.max(0, spellLimits.spells - counts.spells);
      
      const message = [];
      if (cantripsNeeded > 0) message.push(`${cantripsNeeded} заговоров`);
      if (spellsNeeded > 0) message.push(`${spellsNeeded} заклинаний`);
      
      if (message.length > 0) {
        toast({
          title: "Рекомендация",
          description: `Вы можете выбрать еще ${message.join(' и ')}. Продолжить без выбора всех доступных заклинаний?`
        });
      }
    }
    
    // Сохраняем выбранные заклинания
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  // Если персонаж не является заклинателем, пропускаем этот шаг
  if (!isMagicUser()) {
    return null;
  }

  const counts = getSelectedSpellCount();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор заклинаний</h2>
      
      <div className="mb-4 bg-muted/30 p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Класс заклинателя:</span> {character.class}
          </div>
          <div>
            <span className="font-medium">Макс. уровень заклинаний:</span> {maxSpellLevel}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Заговоры:</span> {counts.cantrips}/{spellLimits.cantrips}
          </div>
          <div>
            <span className="font-medium">Заклинания:</span> {counts.spells}/{spellLimits.spells}
          </div>
        </div>
      </div>

      <Input
        type="text"
        placeholder="Поиск заклинаний..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-4"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="level1">1 уровень</TabsTrigger>
          <TabsTrigger value="level2">2 уровень</TabsTrigger>
          <TabsTrigger value="level3plus">3+ уровень</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Доступные заклинания */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">Доступные заклинания</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredSpells.length > 0 ? (
                  filteredSpells.map((spell) => (
                    <div
                      key={spell.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedSpells.some(s => s.name === spell.name)
                          ? 'bg-primary/20 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleSpellSelection(spell)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{spell.name}</h4>
                        <div className="flex gap-2 items-center">
                          <div className="text-xs bg-primary/10 px-2 py-1 rounded">
                            {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                          </div>
                          <Badge variant={spell.school === "Воплощение" ? "destructive" : "outline"} className="text-xs">
                            {spell.school}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {spell.castingTime} • {spell.range}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatComponents(spell.components)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {filterText
                      ? 'Заклинания не найдены, попробуйте изменить поисковый запрос'
                      : 'Заклинания данного уровня недоступны для вашего класса'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Выбранные заклинания */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-2">Выбранные заклинания</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {selectedSpells.length > 0 ? (
                  selectedSpells.map((spell) => (
                    <div
                      key={spell.id || spell.name}
                      className="p-3 border border-primary/40 rounded-md bg-primary/10"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{spell.name}</h4>
                        <div className="flex gap-2">
                          <div className="text-xs bg-primary/20 px-2 py-1 rounded">
                            {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleSpellSelection({
                              id: spell.id || spell.name,
                              name: spell.name,
                              level: spell.level,
                              school: spell.school || '',
                              castingTime: spell.castingTime || '',
                              range: spell.range || '',
                              components: spell.components || '',
                              duration: spell.duration || '',
                              description: spell.description || '',
                              classes: spell.classes || []
                            })}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {spell.school} • {spell.castingTime} • {spell.range}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Вы пока не выбрали ни одного заклинания
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <NavigationButtons
        allowNext={true} // Можно продолжить даже если не выбрано ни одного заклинания
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSpellSelection;
