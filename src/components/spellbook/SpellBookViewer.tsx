
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSpellbook, SpellData } from "@/hooks/spellbook";
import { importSpellsFromText } from "@/hooks/spellbook/importUtils";
import { CharacterSpell } from "@/types/character";
import { convertToSpellData } from "@/hooks/spellbook/filterUtils";
import { Filter, Search, Plus, BookOpen, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const SpellBookViewer = () => {
  const { 
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    selectedSpell,
    isModalOpen,
    activeSchool,
    activeClass,
    handleOpenSpell,
    handleClose,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    currentTheme,
    allLevels,
    allSchools,
    allClasses
  } = useSpellbook();

  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [userSpellbook, setUserSpellbook] = useState<SpellData[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // При загрузке компонента проверяем локальное хранилище
    const savedSpells = localStorage.getItem('userSpellbook');
    if (savedSpells) {
      try {
        const parsedSpells = JSON.parse(savedSpells);
        const spellDataArray = parsedSpells.map((spell: CharacterSpell) => convertToSpellData(spell));
        setUserSpellbook(spellDataArray);
      } catch (e) {
        console.error('Ошибка при загрузке книги заклинаний:', e);
      }
    }
  }, []);

  const saveUserSpellbook = (spells: SpellData[]) => {
    localStorage.setItem('userSpellbook', JSON.stringify(spells));
    setUserSpellbook(spells);
  };

  const handleImport = () => {
    try {
      if (!importText.trim()) {
        toast({
          title: "Внимание",
          description: "Текст для импорта пуст",
          variant: "default"
        });
        return;
      }

      const importedSpells = importSpellsFromText(importText, []);
      
      if (importedSpells.length === 0) {
        toast({
          title: "Внимание",
          description: "Не удалось импортировать заклинания из текста",
          variant: "default"
        });
        return;
      }

      // Конвертируем в SpellData
      const newSpellsData = importedSpells.map(spell => {
        return convertToSpellData({
          ...spell,
          // Если не хватает обязательных полей, добавляем значения по умолчанию
          isRitual: spell.ritual || false,
          isConcentration: spell.concentration || false,
          castingTime: spell.castingTime || "1 действие"
        });
      });

      // Объединяем с существующими, избегая дубликатов
      const updatedSpellbook = [...userSpellbook];
      newSpellsData.forEach(newSpell => {
        if (!updatedSpellbook.some(s => s.name === newSpell.name)) {
          updatedSpellbook.push(newSpell);
        }
      });

      saveUserSpellbook(updatedSpellbook);
      
      toast({
        title: "Импорт успешен",
        description: `Добавлено ${newSpellsData.length} заклинаний в вашу книгу`,
      });
      
      setImportDialogOpen(false);
      setImportText('');
    } catch (error) {
      console.error('Ошибка при импорте заклинаний:', error);
      toast({
        title: "Ошибка импорта",
        description: "Произошла ошибка при импорте заклинаний",
        variant: "destructive"
      });
    }
  };

  const handleAddToSpellbook = (spell: CharacterSpell) => {
    // Проверяем, есть ли уже такое заклинание
    if (userSpellbook.some(s => s.name === spell.name)) {
      toast({
        title: "Заклинание уже добавлено",
        description: `${spell.name} уже присутствует в вашей книге заклинаний`,
        variant: "default"
      });
      return;
    }

    try {
      const spellData = convertToSpellData({
        ...spell,
        // Если не хватает обязательных полей для SpellData, добавляем 
        isRitual: spell.ritual || false,
        isConcentration: spell.concentration || false
      });
      
      const updatedSpellbook = [...userSpellbook, spellData];
      saveUserSpellbook(updatedSpellbook);
      
      toast({
        title: "Заклинание добавлено",
        description: `${spell.name} добавлено в вашу книгу заклинаний`,
      });
    } catch (error) {
      console.error('Ошибка при добавлении заклинания:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить заклинание",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromSpellbook = (spellName: string) => {
    const updatedSpellbook = userSpellbook.filter(s => s.name !== spellName);
    saveUserSpellbook(updatedSpellbook);
    
    toast({
      title: "Заклинание удалено",
      description: `${spellName} удалено из вашей книги заклинаний`,
    });
  };

  const clearSpellbook = () => {
    if (confirm("Вы действительно хотите очистить всю книгу заклинаний?")) {
      saveUserSpellbook([]);
      toast({
        title: "Книга очищена",
        description: "Все заклинания удалены из вашей книги заклинаний",
      });
    }
  };

  // Группируем заклинания в книге по уровням
  const spellsByLevel = userSpellbook.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as {[key: number]: SpellData[]});

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Книга заклинаний</span>
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setImportDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Импортировать
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Готово" : "Редактировать"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="spellbook">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="spellbook">Мои заклинания</TabsTrigger>
              <TabsTrigger value="catalog">Каталог</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spellbook">
              {userSpellbook.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ваша книга заклинаний пуста</h3>
                  <p className="text-muted-foreground mb-6">
                    Добавьте заклинания из каталога или импортируйте их из текста
                  </p>
                  <Button onClick={() => clearSpellbook()} variant="outline" className="mx-auto" disabled={true}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Очистить книгу
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Всего заклинаний: {userSpellbook.length}</h3>
                    <Button onClick={() => clearSpellbook()} variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Очистить книгу
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[60vh]">
                    {Object.entries(spellsByLevel)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([level, spells]) => (
                        <div key={level} className="mb-6">
                          <h3 className="font-semibold mb-2">
                            {level === '0' ? 'Заговоры' : `${level} уровень`}
                            <Badge 
                              variant="secondary" 
                              className="ml-2"
                            >
                              {spells.length}
                            </Badge>
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {spells.map((spell) => (
                              <div 
                                key={spell.name} 
                                className="p-3 bg-background/80 hover:bg-background rounded-md flex justify-between items-center cursor-pointer border border-muted"
                                onClick={() => handleOpenSpell(spell)}
                              >
                                <div>
                                  <div className="font-medium">{spell.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {spell.school} • {spell.castingTime}
                                  </div>
                                </div>
                                
                                {isEditing && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFromSpellbook(spell.name);
                                    }}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Удалить</span>
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="catalog">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Поиск заклинаний..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => clearFilters()}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <h4 className="text-sm font-medium mr-2 flex items-center">Уровни:</h4>
                {allLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={activeLevel.includes(level) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={activeLevel.includes(level) ? {backgroundColor: getBadgeColor(level)} : {}}
                    onClick={() => toggleLevel(level)}
                  >
                    {level === 0 ? "Заговор" : level}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <h4 className="text-sm font-medium mr-2 flex items-center">Школы:</h4>
                {allSchools.map((school) => (
                  <Badge
                    key={school}
                    variant={activeSchool.includes(school) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={activeSchool.includes(school) ? {backgroundColor: getSchoolBadgeColor(school)} : {}}
                    onClick={() => toggleSchool(school)}
                  >
                    {school}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <h4 className="text-sm font-medium mr-2 flex items-center">Классы:</h4>
                {allClasses.map((className) => (
                  <Badge
                    key={className}
                    variant={activeClass.includes(className) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleClass(className)}
                  >
                    {className}
                  </Badge>
                ))}
              </div>
              
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredSpells.length > 0 ? (
                    filteredSpells.map((spell) => (
                      <div 
                        key={spell.id} 
                        className="p-3 bg-background/80 hover:bg-background rounded-md flex justify-between items-center cursor-pointer border border-muted"
                        onClick={() => handleOpenSpell(spell)}
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {spell.school} • {spell.level === 0 ? "Заговор" : `${spell.level} уровень`} • {formatClasses(spell.classes || [])}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToSpellbook(spell);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Добавить
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Заклинания не найдены</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Модальное окно детальной информации о заклинании */}
      {selectedSpell && isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>{selectedSpell.name}</span>
                <Badge 
                  className="ml-2"
                  style={{backgroundColor: getBadgeColor(selectedSpell.level)}}
                >
                  {selectedSpell.level === 0 ? "Заговор" : `${selectedSpell.level} уровень`}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                <Badge variant="outline">{selectedSpell.school}</Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <span className="font-medium text-sm">Время накладывания: </span>
                <span className="text-sm">{selectedSpell.castingTime}</span>
              </div>
              <div>
                <span className="font-medium text-sm">Дистанция: </span>
                <span className="text-sm">{selectedSpell.range}</span>
              </div>
              <div>
                <span className="font-medium text-sm">Компоненты: </span>
                <span className="text-sm">{selectedSpell.components}</span>
              </div>
              <div>
                <span className="font-medium text-sm">Длительность: </span>
                <span className="text-sm">{selectedSpell.duration}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <p>{selectedSpell.description}</p>
              
              {selectedSpell.higherLevels && (
                <div>
                  <h3 className="font-semibold">На больших уровнях:</h3>
                  <p>{selectedSpell.higherLevels}</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedSpell.classes && Array.isArray(selectedSpell.classes) 
                  ? selectedSpell.classes.join(', ')
                  : selectedSpell.classes}
              </div>
              
              <Button 
                onClick={() => {
                  handleAddToSpellbook(selectedSpell);
                  handleClose();
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить в книгу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Диалог импорта заклинаний */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Импорт заклинаний</DialogTitle>
            <DialogDescription>
              Вставьте список заклинаний в текстовом формате
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Введите заклинания по одному в строке, например:
Волшебная стрела (1st уровень)
Огненный шар (3rd уровень)
Малая иллюзия (заговор)"
            rows={10}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="font-mono"
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleImport}>Импортировать</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpellBookViewer;
