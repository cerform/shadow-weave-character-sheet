
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { 
  calculateAvailableSpellsByClassAndLevel, 
  getMaxSpellLevel
} from '@/utils/spellUtils';
import { SpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NavigationButtons from './NavigationButtons';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { 
    availableSpells, 
    loadSpellsForCharacter, 
    getSpellLimits 
  } = useSpellbook();

  const [selectedCantrips, setSelectedCantrips] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('0');

  // Получаем лимиты заклинаний для персонажа
  const { cantripsCount, knownSpells, maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(
    character.class || '',
    character.level || 1,
    getModifierForClass(character)
  );

  useEffect(() => {
    if (character && character.class) {
      loadSpellsForCharacter(character.class, character.level || 1);
    }
  }, [character?.class, character?.level]);

  useEffect(() => {
    // Если у персонажа уже есть заклинания, загружаем их в состояние
    if (character.spells && Array.isArray(character.spells)) {
      const cantrips: SpellData[] = [];
      const spells: SpellData[] = [];
      
      character.spells.forEach(spell => {
        if (typeof spell === 'string') {
          // Ищем соответствующее заклинание в доступных
          const foundSpell = availableSpells.find(s => s.name === spell);
          if (foundSpell) {
            foundSpell.level === 0 
              ? cantrips.push(foundSpell) 
              : spells.push(foundSpell);
          }
        } else {
          // Если это объект заклинания
          const spellData: SpellData = {
            id: spell.id?.toString() || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: spell.name,
            level: spell.level,
            school: spell.school || 'Универсальная',
            castingTime: spell.castingTime || '1 действие',
            range: spell.range || 'Касание',
            components: spell.components || '',
            duration: spell.duration || 'Мгновенная',
            description: spell.description || '',
            classes: spell.classes || [],
            ritual: spell.ritual || false,
            concentration: spell.concentration || false
          };
          
          spell.level === 0
            ? cantrips.push(spellData)
            : spells.push(spellData);
        }
      });
      
      setSelectedCantrips(cantrips);
      setSelectedSpells(spells);
    }
  }, [character.spells, availableSpells]);

  // Получаем модификатор характеристики для класса
  function getModifierForClass(character: Character): number {
    if (!character || !character.abilities) return 0;
    
    const classLower = character?.class?.toLowerCase() || '';
    
    if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
      // Мудрость
      return Math.floor((character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10) - 10) / 2;
    } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
      // Интеллект
      return Math.floor((character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10) - 10) / 2;
    } else {
      // Харизма (бард, колдун, чародей, паладин)
      return Math.floor((character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10) - 10) / 2;
    }
  }

  // Обработчики выбора заклинаний
  const toggleCantripSelection = (cantrip: SpellData) => {
    const isSelected = selectedCantrips.some(s => s.id === cantrip.id);
    
    if (isSelected) {
      setSelectedCantrips(selectedCantrips.filter(s => s.id !== cantrip.id));
    } else {
      if (selectedCantrips.length < cantripsCount) {
        setSelectedCantrips([...selectedCantrips, cantrip]);
      }
    }
  };

  const toggleSpellSelection = (spell: SpellData) => {
    const isSelected = selectedSpells.some(s => s.id === spell.id);
    
    if (isSelected) {
      setSelectedSpells(selectedSpells.filter(s => s.id !== spell.id));
    } else {
      if (selectedSpells.length < knownSpells) {
        setSelectedSpells([...selectedSpells, spell]);
      }
    }
  };

  // Обработчик сохранения заклинаний
  const saveSpells = () => {
    // Преобразуем выбранные заклинания в формат персонажа
    const characterSpells = [
      ...selectedCantrips.map(spell => convertSpellDataToCharacterSpell(spell)),
      ...selectedSpells.map(spell => convertSpellDataToCharacterSpell(spell))
    ];
    
    updateCharacter({ spells: characterSpells });
    
    if (nextStep) {
      nextStep();
    }
  };

  // Фильтруем доступные заклинания
  const filteredSpells = availableSpells.filter(spell => {
    const matchesSearch = searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === '0' && spell.level === 0) || 
      (parseInt(activeTab) === spell.level);
    
    return matchesSearch && matchesTab;
  });

  // Группировка заклинаний по уровням для табов
  const spellLevels = Array.from(
    new Set(availableSpells.map(spell => spell.level))
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выбор заклинаний {character.class}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>Вы можете выбрать:</p>
            <ul className="list-disc pl-5">
              <li>Заговоры: {selectedCantrips.length} / {cantripsCount}</li>
              <li>Заклинания: {selectedSpells.length} / {knownSpells}</li>
              <li>Максимальный уровень заклинаний: {maxSpellLevel}</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заклинаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          
          <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto flex-wrap">
              <TabsTrigger value="all">Все</TabsTrigger>
              {spellLevels.map(level => (
                <TabsTrigger key={`level-${level}`} value={level.toString()}>
                  {level === 0 ? "Заговоры" : `${level} уровень`}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {spellLevels.map(level => (
                    <div key={`level-${level}-spells`} className="space-y-2">
                      <h3 className="font-semibold">
                        {level === 0 ? "Заговоры" : `${level} уровень`}
                        {level === 0 && ` (${selectedCantrips.length}/${cantripsCount})`}
                        {level > 0 && ` (${selectedSpells.length}/${knownSpells})`}
                      </h3>
                      {filteredSpells
                        .filter(spell => spell.level === level)
                        .map(spell => (
                          <div
                            key={`spell-${spell.id}`}
                            className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent/10"
                          >
                            <Checkbox
                              id={`spell-${spell.id}`}
                              checked={
                                spell.level === 0
                                  ? selectedCantrips.some(s => s.id === spell.id)
                                  : selectedSpells.some(s => s.id === spell.id)
                              }
                              onCheckedChange={() =>
                                spell.level === 0
                                  ? toggleCantripSelection(spell)
                                  : toggleSpellSelection(spell)
                              }
                              disabled={
                                spell.level === 0
                                  ? selectedCantrips.length >= cantripsCount && 
                                    !selectedCantrips.some(s => s.id === spell.id)
                                  : selectedSpells.length >= knownSpells &&
                                    !selectedSpells.some(s => s.id === spell.id)
                              }
                            />
                            <div className="flex-grow">
                              <label
                                htmlFor={`spell-${spell.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {spell.name}
                              </label>
                              <div className="text-xs text-muted-foreground space-x-1">
                                <span>{spell.school}</span>
                                {spell.ritual && <Badge variant="outline" className="text-xs">Ритуал</Badge>}
                                {spell.concentration && <Badge variant="outline" className="text-xs">Концентрация</Badge>}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {spellLevels.map(level => (
              <TabsContent key={`content-${level}`} value={level.toString()}>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {level === 0 ? "Заговоры" : `${level} уровень`}
                      {level === 0 && ` (${selectedCantrips.length}/${cantripsCount})`}
                      {level > 0 && ` (${selectedSpells.length}/${knownSpells})`}
                    </h3>
                    {filteredSpells
                      .filter(spell => spell.level === level)
                      .map(spell => (
                        <div
                          key={`level-tab-${spell.id}`}
                          className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent/10"
                        >
                          <Checkbox
                            id={`level-tab-${spell.id}`}
                            checked={
                              spell.level === 0
                                ? selectedCantrips.some(s => s.id === spell.id)
                                : selectedSpells.some(s => s.id === spell.id)
                            }
                            onCheckedChange={() =>
                              spell.level === 0
                                ? toggleCantripSelection(spell)
                                : toggleSpellSelection(spell)
                            }
                            disabled={
                              spell.level === 0
                                ? selectedCantrips.length >= cantripsCount && 
                                  !selectedCantrips.some(s => s.id === spell.id)
                                : selectedSpells.length >= knownSpells &&
                                  !selectedSpells.some(s => s.id === spell.id)
                            }
                          />
                          <div className="flex-grow">
                            <label
                              htmlFor={`level-tab-${spell.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {spell.name}
                            </label>
                            <div className="text-xs text-muted-foreground space-x-1">
                              <span>{spell.school}</span>
                              {spell.ritual && <Badge variant="outline" className="text-xs">Ритуал</Badge>}
                              {spell.concentration && <Badge variant="outline" className="text-xs">Концентрация</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <NavigationButtons
        prevStep={prevStep}
        nextStep={saveSpells}
        nextText="Сохранить и продолжить"
        disableNext={selectedCantrips.length === 0 && selectedSpells.length === 0}
      />
    </div>
  );
};

export default CharacterSpellSelection;
