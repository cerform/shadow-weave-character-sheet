
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useSpellbook } from "@/hooks/spellbook";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, BookOpen, Search, Filter, X, Book, Download } from "lucide-react";
import SpellDetail from './SpellDetail';
import { SpellData } from "@/hooks/spellbook/types";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from "@/hooks/use-toast";
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText } from '@/hooks/spellbook/importUtils';

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
    formatClasses,
  } = useSpellbook();
  
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importedSpells, setImportedSpells] = useState<CharacterSpell[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      setImportText(text);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось прочитать файл",
        variant: "destructive"
      });
    }
  };
  
  const handleImport = () => {
    try {
      const spells = importSpellsFromText(importText, []);
      setImportedSpells(spells);
      
      toast({
        title: "Импорт успешен",
        description: `Импортировано ${spells.length} заклинаний`,
      });
    } catch (error) {
      console.error("Error importing spells:", error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать заклинания",
        variant: "destructive"
      });
    }
  };
  
  // Функция для безопасного доступа к свойствам классов
  const safeFormatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "Нет данных";
    
    if (Array.isArray(classes)) {
      return classes.join(', ');
    } else if (typeof classes === 'string') {
      return classes;
    }
    
    return "Нет данных";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl" style={{ color: currentTheme.textColor }}>
                Книга заклинаний
              </CardTitle>
              <CardDescription style={{ color: currentTheme.mutedTextColor }}>
                Поиск и просмотр заклинаний D&D 5e
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Импорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Фильтры для десктопа */}
            <div className="hidden md:flex flex-col w-60 space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                  Уровень
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allLevels.map(level => (
                    <Badge 
                      key={level} 
                      variant={activeLevel.includes(level) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      style={{ 
                        backgroundColor: activeLevel.includes(level) ? getBadgeColor(level) : "transparent",
                        color: activeLevel.includes(level) ? "white" : currentTheme.textColor,
                        borderColor: getBadgeColor(level),
                      }}
                      onClick={() => toggleLevel(level)}
                    >
                      {level === 0 ? "Заговор" : `${level} круг`}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                  Школа
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allSchools.map(school => (
                    <Badge 
                      key={school} 
                      variant={activeSchool.includes(school) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      style={{ 
                        backgroundColor: activeSchool.includes(school) ? getSchoolBadgeColor(school) : "transparent",
                        color: activeSchool.includes(school) ? "white" : currentTheme.textColor,
                        borderColor: getSchoolBadgeColor(school),
                      }}
                      onClick={() => toggleSchool(school)}
                    >
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                  Класс
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allClasses.map(className => (
                    <Badge 
                      key={className} 
                      variant={activeClass.includes(className) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      style={{ 
                        backgroundColor: activeClass.includes(className) ? currentTheme.accent : "transparent",
                        color: activeClass.includes(className) ? "white" : currentTheme.textColor,
                        borderColor: currentTheme.accent,
                      }}
                      onClick={() => toggleClass(className)}
                    >
                      {className}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
                <Button 
                  variant="ghost" 
                  className="mt-2" 
                  onClick={clearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Сбросить фильтры
                </Button>
              )}
            </div>
            
            {/* Основной контент */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                  <Input 
                    className="pl-9 bg-card/30 backdrop-blur-sm border-primary/20"
                    placeholder="Поиск заклинаний..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      color: currentTheme.textColor
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 md:hidden"
                    onClick={() => setIsFilterDrawerOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[60vh] pr-4">
                  {filteredSpells.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredSpells.map(spell => (
                        <Card 
                          key={spell.id || spell.name} 
                          className="cursor-pointer hover:bg-primary/5 transition border-primary/20 bg-card/30 backdrop-blur-sm"
                          onClick={() => handleOpenSpell(spell)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-base mb-1" style={{ color: currentTheme.textColor }}>
                                {spell.name}
                              </h3>
                              <Badge 
                                style={{ 
                                  backgroundColor: getBadgeColor(spell.level),
                                  color: "white"
                                }}
                              >
                                {spell.level === 0 ? "Заговор" : `${spell.level} круг`}
                              </Badge>
                            </div>
                            <div className="flex gap-1 mb-2">
                              <Badge 
                                variant="outline"
                                style={{ 
                                  backgroundColor: `${getSchoolBadgeColor(spell.school)}30`,
                                  color: currentTheme.textColor,
                                  borderColor: getSchoolBadgeColor(spell.school)
                                }}
                              >
                                {spell.school}
                              </Badge>
                              {spell.ritual && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    backgroundColor: `${currentTheme.accent}20`,
                                    color: currentTheme.textColor,
                                    borderColor: currentTheme.accent
                                  }}
                                >
                                  Ритуал
                                </Badge>
                              )}
                              {spell.concentration && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    backgroundColor: `${currentTheme.accent}20`,
                                    color: currentTheme.textColor,
                                    borderColor: currentTheme.accent
                                  }}
                                >
                                  Концентрация
                                </Badge>
                              )}
                            </div>
                            <div>
                              <p className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>
                                <strong>Время накладывания:</strong> {spell.castingTime}
                              </p>
                              <p className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>
                                <strong>Дистанция:</strong> {spell.range}
                              </p>
                              <p className="text-xs mb-1" style={{ color: currentTheme.mutedTextColor }}>
                                <strong>Длительность:</strong> {spell.duration}
                              </p>
                              <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                                <strong>Классы:</strong> {safeFormatClasses(spell.classes)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40">
                      <BookOpen className="h-12 w-12 mb-4 text-primary/30" />
                      <p className="text-lg font-medium mb-1" style={{ color: currentTheme.textColor }}>
                        Заклинания не найдены
                      </p>
                      <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
                        Попробуйте изменить параметры поиска
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
            Всего заклинаний: {filteredSpells.length}
          </p>
        </CardFooter>
      </Card>
      
      {/* Отображение деталей заклинания */}
      {isDesktop ? (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[600px] bg-card/30 backdrop-blur-sm border-primary/20">
            {selectedSpell && <SpellDetail spell={selectedSpell} />}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isModalOpen} onClose={handleClose}>
          <DrawerContent className="bg-card/95 backdrop-blur-sm border-t border-primary/20">
            <DrawerHeader>
              <DrawerTitle>{selectedSpell?.name}</DrawerTitle>
              <DrawerDescription>
                {selectedSpell?.level === 0 ? "Заговор" : `${selectedSpell?.level} круг`} ({selectedSpell?.school})
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2 pb-8">
              {selectedSpell && <SpellDetail spell={selectedSpell} isDrawer />}
            </div>
          </DrawerContent>
        </Drawer>
      )}
      
      {/* Фильтры для мобильных устройств */}
      <Drawer open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)}>
        <DrawerContent className="bg-card/95 backdrop-blur-sm border-t border-primary/20">
          <DrawerHeader>
            <DrawerTitle>Фильтры</DrawerTitle>
            <DrawerDescription>
              Выберите фильтры для поиска заклинаний
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 pb-8 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                Уровень
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allLevels.map(level => (
                  <Badge 
                    key={level} 
                    variant={activeLevel.includes(level) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    style={{ 
                      backgroundColor: activeLevel.includes(level) ? getBadgeColor(level) : "transparent",
                      color: activeLevel.includes(level) ? "white" : currentTheme.textColor,
                      borderColor: getBadgeColor(level),
                    }}
                    onClick={() => toggleLevel(level)}
                  >
                    {level === 0 ? "Заговор" : `${level} круг`}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                Школа
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allSchools.map(school => (
                  <Badge 
                    key={school} 
                    variant={activeSchool.includes(school) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    style={{ 
                      backgroundColor: activeSchool.includes(school) ? getSchoolBadgeColor(school) : "transparent",
                      color: activeSchool.includes(school) ? "white" : currentTheme.textColor,
                      borderColor: getSchoolBadgeColor(school),
                    }}
                    onClick={() => toggleSchool(school)}
                  >
                    {school}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                Класс
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allClasses.map(className => (
                  <Badge 
                    key={className} 
                    variant={activeClass.includes(className) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    style={{ 
                      backgroundColor: activeClass.includes(className) ? currentTheme.accent : "transparent",
                      color: activeClass.includes(className) ? "white" : currentTheme.textColor,
                      borderColor: currentTheme.accent,
                    }}
                    onClick={() => toggleClass(className)}
                  >
                    {className}
                  </Badge>
                ))}
              </div>
            </div>
            
            {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
              <Button 
                variant="ghost" 
                className="mt-2 w-full" 
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Сбросить фильтры
              </Button>
            )}
            
            <Button 
              className="w-full mt-2"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              Применить
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Диалог импорта заклинаний */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card/30 backdrop-blur-sm border-primary/20">
          <DialogHeader>
            <DialogTitle>Импорт заклинаний</DialogTitle>
            <DialogDescription>
              Вставьте JSON или текст с заклинаниями для импорта
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importText">Текст для импорта</Label>
              <textarea 
                id="importText"
                className="w-full h-32 p-2 border rounded-md bg-card/30"
                placeholder="Вставьте JSON или список заклинаний, по одному на строку"
                value={importText} 
                onChange={e => setImportText(e.target.value)}
              />
            </div>
            <div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить из файла
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json,.txt"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleImport}
              disabled={!importText}
            >
              Импортировать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpellBookViewer;
