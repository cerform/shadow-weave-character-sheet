
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
import SpellDetailModal from '@/components/spellbook/SpellDetailModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface SpellOption {
  id?: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  source?: string;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(character.spells || []);
  const [availableSpells, setAvailableSpells] = useState<SpellOption[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellOption[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpellDetails, setSelectedSpellDetails] = useState<SpellOption | null>(null);
  const [isSpellDetailsOpen, setIsSpellDetailsOpen] = useState(false);
  
  // Загружаем доступные заклинания для класса персонажа
  useEffect(() => {
    const allSpells = getAllSpells();
    
    if (character.className) {
      // Фильтруем заклинания по классу персонажа
      const classSpells = allSpells.filter(spell => 
        spell.classes.some(spellClass => 
          spellClass.toLowerCase().includes(character.className?.toLowerCase() || '')
        )
      );
      
      setAvailableSpells(classSpells);
      setFilteredSpells(classSpells.filter(spell => spell.level === parseInt(activeTab, 10)));
    } else {
      setAvailableSpells([]);
      setFilteredSpells([]);
    }
  }, [character.className]);
  
  // Фильтруем заклинания при изменении активного таба или поискового запроса
  useEffect(() => {
    const level = parseInt(activeTab, 10);
    let filtered = availableSpells.filter(spell => spell.level === level);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(query) || 
        spell.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSpells(filtered);
  }, [activeTab, searchQuery, availableSpells]);
  
  // Определяем количество доступных для выбора заклинаний
  const getAvailableSpellCount = () => {
    if (!character.className || !character.level) return 0;
    
    // Логика расчета количества заклинаний в зависимости от класса и уровня
    switch(character.className.toLowerCase()) {
      case 'волшебник':
        return 6 + (character.level > 1 ? (character.level - 1) * 2 : 0);
      case 'чародей':
      case 'жрец':
      case 'друид':
      case 'бард':
        return character.level + Math.max(0, Math.floor((getAbilityModifier() + 1) / 2));
      case 'колдун':
        return Math.min(8, Math.max(1, Math.ceil(character.level / 2) + 1));
      default:
        return 0;
    }
  };
  
  // Получаем модификатор основной характеристики заклинаний
  const getAbilityModifier = () => {
    if (!character.abilities) return 0;
    
    switch(character.className?.toLowerCase()) {
      case 'волшебник':
        return Math.floor((character.abilities.intelligence - 10) / 2);
      case 'чародей':
      case 'бард':
      case 'колдун':
        return Math.floor((character.abilities.charisma - 10) / 2);
      case 'жрец':
      case 'друид':
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
  const handleAddSpell = (spell: SpellOption) => {
    // Проверяем, что заклинание еще не выбрано и можно добавить еще заклинания
    if (
      selectedSpells.some(s => s.name === spell.name) ||
      !canSelectMoreSpells()
    ) {
      return;
    }
    
    const newSpell: CharacterSpell = {
      id: spell.id || `spell-${Date.now()}`,
      name: spell.name,
      level: spell.level,
      description: spell.description,
      castingTime: spell.castingTime,
      school: spell.school,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      prepared: false
    };
    
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
  
  const handleShowSpellDetails = (spell: SpellOption) => {
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
                  key={spell.id} 
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
                        <p className="text-xs text-muted-foreground line-clamp-2">{spell.description.split('.')[0]}.</p>
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
                  <p>{selectedSpellDetails.classes.join(', ')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Описание</Label>
                <ScrollArea className="h-[200px] w-full mt-2 pr-4">
                  <p className="text-sm whitespace-pre-line">{selectedSpellDetails.description}</p>
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
