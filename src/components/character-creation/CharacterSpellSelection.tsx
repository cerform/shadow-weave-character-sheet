
import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationButtons from './NavigationButtons';
import SectionHeader from '@/components/ui/section-header';
import { getAllSpells } from '@/data/spells';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Book, Plus, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { normalizeSpells, convertToSpellData, convertToSpellDataArray } from '@/utils/spellUtils';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Используем SpellData из типов для совместимости
type SpellOption = SpellData;

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  // Преобразуем массив заклинаний в нужный формат
  const normalizedSpells = character.spells ? normalizeSpells(character.spells) : [];
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(normalizedSpells);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpellDetails, setSelectedSpellDetails] = useState<SpellData | null>(null);
  const [isSpellDetailsOpen, setIsSpellDetailsOpen] = useState(false);
  
  // Загружаем доступные заклинания для класса персонажа
  useEffect(() => {
    const allSpells = getAllSpells();
    
    if (character.className || character.class) {
      const className = character.className || character.class;
      // Фильтруем заклинания по классу персонажа, учитывая максимальный уровень заклинаний
      const classSpells = allSpells.filter(spell => {
        // Проверяем, что classes существует
        if (!spell.classes) return false;
        
        const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
        
        // Проверяем уровень заклинания в зависимости от уровня персонажа
        const characterLevel = character.level || 1;
        const maxSpellLevel = getMaxSpellLevel(className || '', characterLevel);
        
        return spell.level <= maxSpellLevel && spellClasses.some(spellClass => 
          spellClass && typeof spellClass === 'string' && 
          spellClass.toLowerCase().includes(className?.toLowerCase() || '')
        );
      });
      
      console.log(`Найдено ${classSpells.length} заклинаний для класса ${className}`);
      
      // Преобразуем CharacterSpell в SpellData для правильной типизации
      const convertedSpells = convertToSpellDataArray(classSpells);
      setAvailableSpells(convertedSpells);
      setFilteredSpells(convertedSpells.filter(spell => spell.level === parseInt(activeTab, 10)));
    } else {
      setAvailableSpells([]);
      setFilteredSpells([]);
    }
  }, [character.className, character.class, character.level]);
  
  // Фильтруем заклинания при изменении активного таба или поискового запроса
  useEffect(() => {
    const level = parseInt(activeTab, 10);
    let filtered = availableSpells.filter(spell => spell.level === level);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(query) || 
        (typeof spell.description === 'string' && spell.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredSpells(filtered);
  }, [activeTab, searchQuery, availableSpells]);
  
  // Определяем максимальный уровень заклинаний в зависимости от класса и уровня персонажа
  const getMaxSpellLevel = (className: string, characterLevel: number): number => {
    // Преобразуем название класса к нижнему регистру для сравнения
    const normalizedClass = className.toLowerCase();
    
    // Полные заклинатели (до 9-го уровня)
    if (['волшебник', 'жрец', 'друид', 'бард', 'чародей'].includes(normalizedClass)) {
      if (characterLevel >= 17) return 9;
      if (characterLevel >= 15) return 8;
      if (characterLevel >= 13) return 7;
      if (characterLevel >= 11) return 6;
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      return 1;
    } 
    // Полузаклинатели (до 5-го уровня)
    else if (['паладин', 'следопыт', 'рейнджер'].includes(normalizedClass)) {
      if (characterLevel >= 17) return 5;
      if (characterLevel >= 13) return 4;
      if (characterLevel >= 9) return 3;
      if (characterLevel >= 5) return 2;
      if (characterLevel >= 2) return 1;
      return 0;
    }
    // Особые заклинатели (колдун)
    else if (['колдун', 'чернокнижник'].includes(normalizedClass)) {
      if (characterLevel >= 17) return 5; // У колдуна особая механика, но максимум 5 уровень слотов
      if (characterLevel >= 11) return 5;
      if (characterLevel >= 9) return 5;
      if (characterLevel >= 7) return 4;
      if (characterLevel >= 5) return 3;
      if (characterLevel >= 3) return 2;
      return 1;
    }
    // Для остальных классов
    return 0;
  };
  
  // Определяем количество доступных для выбора заклинаний
  const getAvailableSpellCount = (): number => {
    if (!character.className && !character.class || !character.level) return 0;
    
    const className = character.className || character.class;
    if (!className) return 0;
    
    // Логика расчета количества заклинаний в зависимости от класса и уровня
    const normalizedClass = className.toLowerCase();
    const characterLevel = character.level || 1;
    
    console.log(`Расчет количества заклинаний для ${normalizedClass} уровня ${characterLevel}`);
    
    switch(normalizedClass) {
      case 'волшебник':
        return 6 + (characterLevel > 1 ? (characterLevel - 1) * 2 : 0);
      case 'чародей':
        return Math.min(15, characterLevel + 1);
      case 'жрец':
      case 'друид':
        return characterLevel + Math.max(0, getAbilityModifier());
      case 'бард':
        return Math.min(22, 4 + (characterLevel > 1 ? (characterLevel - 1) * 1 : 0));
      case 'колдун':
      case 'чернокнижник':
        return Math.min(15, Math.max(1, Math.ceil(characterLevel / 2) + 1));
      case 'паладин':
      case 'следопыт':
      case 'рейнджер':
        return Math.min(11, Math.ceil(characterLevel / 2) + 1);
      default:
        return characterLevel > 3 ? 4 : characterLevel; // Базовое значение для остальных классов
    }
  };
  
  // Получаем модификатор основной характеристики заклинаний
  const getAbilityModifier = (): number => {
    if (!character.abilities) return 0;
    
    const className = (character.className || character.class || '').toLowerCase();
    
    switch(className) {
      case 'волшебник':
        return Math.floor((character.abilities.intelligence - 10) / 2);
      case 'чародей':
      case 'бард':
      case 'колдун':
      case 'чернокнижник':
        return Math.floor((character.abilities.charisma - 10) / 2);
      case 'жрец':
      case 'друид':
      case 'следопыт':
      case 'рейнджер':
        return Math.floor((character.abilities.wisdom - 10) / 2);
      default:
        return 0;
    }
  };
  
  // Определяем, можно ли выбрать еще заклинания
  const canSelectMoreSpells = () => {
    const maxSpells = getAvailableSpellCount();
    return selectedSpells.length < maxSpells;
  };
  
  // Обработчик добавления заклинания
  const handleAddSpell = (spell: SpellData) => {
    // Проверяем, что заклинание еще не выбрано и можно добавить еще заклинания
    if (
      selectedSpells.some(s => s.name === spell.name) ||
      !canSelectMoreSpells()
    ) {
      return;
    }
    
    // Преобразуем SpellData в CharacterSpell
    const newSpell = convertSpellDataToCharacterSpell(spell);
    
    const updatedSpells = [...selectedSpells, newSpell];
    setSelectedSpells(updatedSpells);
    updateCharacter({ spells: updatedSpells });
  };
  
  // Обработчик удаления заклинания
  const handleRemoveSpell = (spellName: string) => {
    const updatedSpells = selectedSpells.filter(spell => spell.name !== spellName);
    setSelectedSpells(updatedSpells);
    updateCharacter({ spells: updatedSpells });
  };
  
  // Получаем количество выбранных заклинаний по уровням
  const getSpellCountByLevel = (level: number) => {
    return selectedSpells.filter(spell => spell.level === level).length;
  };
  
  const handleShowSpellDetails = (spell: SpellData) => {
    setSelectedSpellDetails(spell);
    setIsSpellDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Выбор заклинаний"
        description={`Выберите заклинания для вашего персонажа. Доступно ${getAvailableSpellCount()} заклинаний.`}
      />
      
      {/* Выбранные заклинания */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Выбранные заклинания ({selectedSpells.length}/{getAvailableSpellCount()})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSpells.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedSpells.map((spell) => (
                <div 
                  key={spell.id || spell.name} 
                  className="flex justify-between items-center p-2 border border-border rounded-md bg-black/20"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${spell.level === 0 ? 'bg-gray-700' : 'bg-primary/20'}`}>
                      {spell.level === 0 ? 'Заговор' : `Ур. ${spell.level}`}
                    </Badge>
                    <span className="font-medium">{spell.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveSpell(spell.name)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Вы ещё не выбрали ни одного заклинания
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Список доступных заклинаний */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные заклинания</CardTitle>
          <CardDescription>Выберите заклинания из списка для вашего класса</CardDescription>
          
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заклинаний..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5 mb-4">
              <TabsTrigger value="0" className="relative">
                Заговоры
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {getSpellCountByLevel(0)}
                </Badge>
              </TabsTrigger>
              {[1, 2, 3, 4].map((level) => (
                <TabsTrigger key={level} value={level.toString()} className="relative">
                  {level}
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {getSpellCountByLevel(level)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSpells.length > 0 ? (
                  filteredSpells.map((spell) => {
                    const isSelected = selectedSpells.some(s => s.name === spell.name);
                    const description = typeof spell.description === 'string' 
                      ? spell.description 
                      : Array.isArray(spell.description) 
                        ? spell.description.join('\n') 
                        : '';
                    
                    return (
                      <div 
                        key={spell.name}
                        className={`flex flex-col border rounded-md p-3 gap-2 transition-colors ${
                          isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/10'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{spell.name}</h4>
                          <Badge>{spell.school}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {description.split('.')[0]}.
                        </p>
                        <div className="flex justify-between items-center mt-auto pt-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleShowSpellDetails(spell)}
                                  className="h-8 px-2"
                                >
                                  <Book className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Подробнее</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Показать детали заклинания</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant={isSelected ? "destructive" : "secondary"}
                                  size="sm"
                                  onClick={() => isSelected ? handleRemoveSpell(spell.name) : handleAddSpell(spell)}
                                  disabled={!isSelected && !canSelectMoreSpells()}
                                  className="h-8 px-2"
                                >
                                  {isSelected ? (
                                    <X className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Plus className="h-4 w-4 mr-1" />
                                  )}
                                  <span className="text-xs">
                                    {isSelected ? 'Удалить' : 'Выбрать'}
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isSelected ? 
                                  <p>Удалить заклинание</p> : 
                                  !canSelectMoreSpells() ? 
                                  <p>Достигнут лимит заклинаний</p> :
                                  <p>Добавить заклинание</p>
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-4">
                    {searchQuery ? 'Нет заклинаний, соответствующих поиску' : 'Нет доступных заклинаний этого уровня'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
      
      <NavigationButtons
        allowNext={true}
        nextStep={nextStep}
        prevStep={prevStep}
      />
      
      <Dialog open={isSpellDetailsOpen} onOpenChange={setIsSpellDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedSpellDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedSpellDetails.name}</h2>
                <Badge className="ml-auto">{selectedSpellDetails.school}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">Уровень</Label>
                  <p>{selectedSpellDetails.level === 0 ? 'Заговор' : selectedSpellDetails.level}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Время накладывания</Label>
                  <p>{selectedSpellDetails.castingTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Дальность</Label>
                  <p>{selectedSpellDetails.range}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Компоненты</Label>
                  <p>{selectedSpellDetails.components}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Длительность</Label>
                  <p>{selectedSpellDetails.duration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Классы</Label>
                  <p>
                    {Array.isArray(selectedSpellDetails.classes) 
                      ? selectedSpellDetails.classes.join(', ') 
                      : selectedSpellDetails.classes || 'Н/Д'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Описание</Label>
                <ScrollArea className="h-[200px] w-full mt-2 pr-4">
                  <p className="text-sm whitespace-pre-line">
                    {typeof selectedSpellDetails.description === 'string' 
                      ? selectedSpellDetails.description 
                      : Array.isArray(selectedSpellDetails.description) 
                        ? selectedSpellDetails.description.join('\n') 
                        : 'Нет описания'}
                  </p>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsSpellDetailsOpen(false)} 
                  className="mr-2"
                >
                  Закрыть
                </Button>
                {!selectedSpells.some(s => s.name === selectedSpellDetails.name) && canSelectMoreSpells() && (
                  <Button 
                    onClick={() => {
                      handleAddSpell(selectedSpellDetails);
                      setIsSpellDetailsOpen(false);
                    }}
                    variant="default"
                  >
                    Выбрать заклинание
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacterSpellSelection;
