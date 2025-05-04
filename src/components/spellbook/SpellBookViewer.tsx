
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSpellbook, importSpellsFromText } from '@/hooks/spellbook';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SpellData } from '@/hooks/spellbook/types';
import { CharacterSpell } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, X, Bookmark, BookOpen, Download, Upload } from 'lucide-react';

const SpellBookViewer: React.FC = () => {
  const { 
    filteredSpells, 
    searchTerm, 
    setSearchTerm,
    activeLevel,
    selectedSpell,
    isModalOpen,
    activeSchool,
    activeClass,
    currentTheme,
    allLevels,
    allSchools,
    allClasses,
    handleOpenSpell,
    handleClose,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses
  } = useSpellbook();

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();

  // Добавление заклинания к персонажу
  const addSpellToCharacter = (spell: CharacterSpell) => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    // Проверяем, есть ли уже такое заклинание у персонажа
    const existingSpells = character.spells || [];
    const spellNames = existingSpells.map(s => typeof s === 'string' ? s : s.name);
    
    if (spellNames.includes(spell.name)) {
      toast({
        title: "Предупреждение",
        description: `Заклинание ${spell.name} уже в списке персонажа`,
        variant: "destructive"
      });
      return;
    }

    // Добавляем заклинание к персонажу
    const updatedSpells = [...existingSpells, spell];
    updateCharacter({ spells: updatedSpells as CharacterSpell[] | string[] });

    toast({
      title: "Успешно",
      description: `Заклинание ${spell.name} добавлено персонажу ${character.name}`
    });
  };

  // Обработчик импорта заклинаний из текста
  const handleImportSpells = () => {
    if (!importText || !character) {
      toast({
        title: "Ошибка",
        description: "Введите текст для импорта или выберите персонажа",
        variant: "destructive"
      });
      return;
    }

    const importedSpells = importSpellsFromText(importText);
    
    if (importedSpells.length === 0) {
      toast({
        title: "Ошибка",
        description: "Не удалось распознать заклинания в тексте",
        variant: "destructive"
      });
      return;
    }

    // Добавляем только те заклинания, которых ещё нет у персонажа
    const existingSpells = character.spells || [];
    const existingSpellNames = existingSpells.map(s => typeof s === 'string' ? s : s.name);
    
    const newSpells = importedSpells.filter(spell => !existingSpellNames.includes(spell.name));
    
    if (newSpells.length === 0) {
      toast({
        title: "Информация",
        description: "Все заклинания из текста уже есть у персонажа",
        variant: "warning"
      });
      setImportDialogOpen(false);
      return;
    }

    // Обновляем персонажа с новыми заклинаниями
    const updatedSpells = [...existingSpells, ...newSpells];
    updateCharacter({ spells: updatedSpells as CharacterSpell[] | string[] });

    toast({
      title: "Успешно",
      description: `Добавлено ${newSpells.length} заклинаний из текста`
    });
    
    setImportText('');
    setImportDialogOpen(false);
  };

  const spellsByLevel = React.useMemo(() => {
    const grouped: Record<number, SpellData[]> = {};
    
    filteredSpells.forEach(spell => {
      if (!grouped[spell.level]) {
        grouped[spell.level] = [];
      }
      grouped[spell.level].push(spell);
    });
    
    // Сортируем заклинания по алфавиту внутри каждого уровня
    Object.keys(grouped).forEach(level => {
      grouped[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, [filteredSpells]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Книга заклинаний</CardTitle>
            <p className="text-muted-foreground mt-1">
              Найдено {filteredSpells.length} заклинаний
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Импорт
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Поиск */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск заклинаний..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Фильтры */}
          {showFilters && (
            <div className="bg-card/20 p-4 rounded-md mb-4 space-y-3">
              <div>
                <h3 className="font-medium mb-2 text-sm">Уровень</h3>
                <div className="flex flex-wrap gap-2">
                  {allLevels.map(level => (
                    <Badge 
                      key={level} 
                      className="cursor-pointer"
                      variant={activeLevel.includes(level) ? "default" : "outline"}
                      onClick={() => toggleLevel(level)}
                    >
                      {level === 0 ? 'Заговор' : `${level} уровень`}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-sm">Школа</h3>
                <div className="flex flex-wrap gap-2">
                  {allSchools.map(school => (
                    <Badge 
                      key={school} 
                      className="cursor-pointer"
                      variant={activeSchool.includes(school) ? "default" : "outline"}
                      onClick={() => toggleSchool(school)}
                    >
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-sm">Класс</h3>
                <div className="flex flex-wrap gap-2">
                  {allClasses.map(className => (
                    <Badge 
                      key={className} 
                      className="cursor-pointer"
                      variant={activeClass.includes(className) ? "default" : "outline"}
                      onClick={() => toggleClass(className)}
                    >
                      {className}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          )}

          {/* Табы для десктопа */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList className="grid grid-cols-5 mb-4 w-auto">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
                <TabsTrigger value="low">1-3</TabsTrigger>
                <TabsTrigger value="mid">4-6</TabsTrigger>
                <TabsTrigger value="high">7-9</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <SpellList 
                spells={filteredSpells}
                getBadgeColor={getBadgeColor}
                formatClasses={formatClasses}
                onSpellClick={handleOpenSpell}
                addSpellToCharacter={addSpellToCharacter}
              />
            </TabsContent>
            
            <TabsContent value="cantrips">
              <SpellList 
                spells={filteredSpells.filter(spell => spell.level === 0)}
                getBadgeColor={getBadgeColor}
                formatClasses={formatClasses}
                onSpellClick={handleOpenSpell}
                addSpellToCharacter={addSpellToCharacter}
              />
            </TabsContent>
            
            <TabsContent value="low">
              <SpellList 
                spells={filteredSpells.filter(spell => spell.level >= 1 && spell.level <= 3)}
                getBadgeColor={getBadgeColor}
                formatClasses={formatClasses}
                onSpellClick={handleOpenSpell}
                addSpellToCharacter={addSpellToCharacter}
              />
            </TabsContent>
            
            <TabsContent value="mid">
              <SpellList 
                spells={filteredSpells.filter(spell => spell.level >= 4 && spell.level <= 6)}
                getBadgeColor={getBadgeColor}
                formatClasses={formatClasses}
                onSpellClick={handleOpenSpell}
                addSpellToCharacter={addSpellToCharacter}
              />
            </TabsContent>
            
            <TabsContent value="high">
              <SpellList 
                spells={filteredSpells.filter(spell => spell.level >= 7 && spell.level <= 9)}
                getBadgeColor={getBadgeColor}
                formatClasses={formatClasses}
                onSpellClick={handleOpenSpell}
                addSpellToCharacter={addSpellToCharacter}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Модальное окно с деталями заклинания */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
          {selectedSpell && (
            <>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedSpell.name}</span>
                <Badge className={getBadgeColor(selectedSpell.level)}>
                  {selectedSpell.level === 0 ? 'Заговор' : `${selectedSpell.level} уровень`}
                </Badge>
              </DialogTitle>
              
              <div className="space-y-4 mt-2">
                <Badge variant="outline" className={getSchoolBadgeColor(selectedSpell.school)}>
                  {selectedSpell.school}
                </Badge>
                
                {(selectedSpell.isRitual || selectedSpell.isConcentration) && (
                  <div className="flex gap-2 mt-2">
                    {selectedSpell.isRitual && (
                      <Badge variant="secondary">Ритуал</Badge>
                    )}
                    {selectedSpell.isConcentration && (
                      <Badge variant="secondary">Концентрация</Badge>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="font-semibold">Время накладывания:</p>
                    <p>{selectedSpell.castingTime}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Дистанция:</p>
                    <p>{selectedSpell.range}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Компоненты:</p>
                    <p>{selectedSpell.components}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Длительность:</p>
                    <p>{selectedSpell.duration}</p>
                  </div>
                </div>
                
                <div className="border-t border-b border-border py-4 my-4">
                  <p className="whitespace-pre-wrap">{selectedSpell.description}</p>
                  
                  {selectedSpell.higherLevels && (
                    <div className="mt-4">
                      <p className="font-semibold">На более высоких уровнях:</p>
                      <p>{selectedSpell.higherLevels}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Классы: {Array.isArray(selectedSpell.classes) ? selectedSpell.classes.join(', ') : selectedSpell.classes}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => addSpellToCharacter(selectedSpell)}
                    className="flex items-center gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    Добавить к персонажу
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Диалог импорта заклинаний */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Импорт заклинаний из текста</DialogTitle>
          <DialogDescription>
            Введите список заклинаний в формате "Название заклинания (уровень)" или "Название (заговор)".
            Каждое заклинание должно быть на отдельной строке.
          </DialogDescription>
          
          <div className="space-y-4 mt-2">
            <div className="grid w-full gap-2">
              <Label htmlFor="importText">Текст для импорта:</Label>
              <textarea 
                id="importText" 
                className="w-full h-40 p-2 border rounded-md resize-none"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Огненная стрела (3rd уровень)&#10;Волшебная рука (заговор)&#10;Лечащее слово (1st уровень)"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setImportDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleImportSpells}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Импортировать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Компонент для отображения списка заклинаний
interface SpellListProps {
  spells: SpellData[];
  getBadgeColor: (level: number) => string;
  formatClasses: (classes: string[] | string) => string;
  onSpellClick: (spell: SpellData) => void;
  addSpellToCharacter: (spell: CharacterSpell) => void;
}

const SpellList: React.FC<SpellListProps> = ({ 
  spells, 
  getBadgeColor, 
  formatClasses, 
  onSpellClick,
  addSpellToCharacter
}) => {
  if (spells.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Нет заклинаний</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Заклинания, соответствующие выбранным фильтрам, не найдены. 
          Попробуйте изменить параметры поиска.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {Array.from(new Set(spells.map(spell => spell.level)))
          .sort((a, b) => a - b)
          .map(level => (
            <div key={level} className="space-y-2">
              <h3 className="font-medium text-lg">
                {level === 0 ? 'Заговоры' : `Заклинания ${level}-го уровня`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {spells
                  .filter(spell => spell.level === level)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(spell => (
                    <Card
                      key={spell.id || spell.name}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => onSpellClick(spell)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{spell.name}</p>
                          <p className="text-xs text-muted-foreground">{spell.school}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getBadgeColor(spell.level)}>
                            {spell.level === 0 ? 'З' : spell.level}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              addSpellToCharacter(spell);
                            }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
};

export default SpellBookViewer;
