
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Wand2, Search, X, Filter, BookOpen, Download, Upload, Plus, Sparkles } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSpellbook } from '@/hooks/spellbook';
import SpellList from './SpellList';
import { CharacterSpell } from '@/types/character.d';
import { SpellData, convertToCharacterSpell } from '@/hooks/spellbook/types';

const SpellBookViewer = () => {
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
    importSpellsFromText
  } = useSpellbook();
  
  const { theme } = useTheme();
  const themeData = themes[theme as keyof typeof themes] || themes.default;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const { toast } = useToast();
  
  // State for spell data
  const [spellsData, setSpellsData] = useState<SpellData[]>([]);

  const handleImportSpells = () => {
    if (!importText.trim()) {
      toast({
        title: "Ошибка импорта",
        description: "Текст для импорта не может быть пустым.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const importedSpells = importSpellsFromText(importText);
      
      if (importedSpells.length > 0) {
        // Convert CharacterSpell to SpellData
        const importedSpellsData = importedSpells.map(spell => ({
          ...spell,
          school: spell.school || 'Неизвестная', // Provide a default for required field
          prepared: spell.prepared || false
        }));
        
        // Обновляем список заклинаний (в реальном приложении здесь будет обновление хранилища)
        setSpellsData(importedSpellsData);
        
        toast({
          title: "Импорт успешен",
          description: `Импортировано ${importedSpells.length} заклинаний.`
        });
        
        setImportDialogOpen(false);
        setImportText('');
      } else {
        toast({
          title: "Импорт не удался",
          description: "Не удалось распознать заклинания в тексте."
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка импорта",
        description: "Произошла ошибка при обработке текста.",
        variant: "destructive"
      });
    }
  };

  const handleExportSpells = () => {
    // Пример экспорта заклинаний в текстовом формате
    const exportText = filteredSpells.map(spell => {
      return `${spell.name} (${spell.level === 0 ? 'Заговор' : `${spell.level} уровень`})\n` +
        `Школа: ${spell.school}\n` +
        `Время накладывания: ${spell.castingTime}\n` +
        `Дальность: ${spell.range}\n` +
        `Компоненты: ${spell.components}\n` +
        `Длительность: ${spell.duration}\n` +
        (spell.ritual ? 'Ритуал: Да\n' : '') +
        (spell.concentration ? 'Концентрация: Да\n' : '') +
        `Классы: ${formatClasses(spell.classes)}\n\n` +
        `${spell.description}\n\n` +
        (spell.higherLevels ? `На более высоких уровнях: ${spell.higherLevels}\n\n` : '') +
        '-----------------------------------\n\n';
    }).join('');

    // Создаем временный blob и ссылку для скачивания
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spellbook_export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Экспорт успешен",
      description: `Экспортировано ${filteredSpells.length} заклинаний.`
    });
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(to bottom, ${themeData.accent}20, ${themeData.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
      }}
    >
      <div className="container mx-auto py-8 px-4">
        <Card 
          className="border border-accent"
          style={{ 
            backgroundColor: `${themeData.cardBackground || 'rgba(0, 0, 0, 0.75)'}`
          }}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-2xl" style={{color: themeData.textColor || 'white'}}>
                <Wand2 className="inline-block mr-2" />
                Книга заклинаний
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                  style={{
                    borderColor: themeData.accent,
                    color: themeData.textColor || 'white'
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Импорт
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportSpells}
                  style={{
                    borderColor: themeData.accent,
                    color: themeData.textColor || 'white'
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Экспорт
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заклинаний..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-8"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: themeData.textColor || 'white',
                    borderColor: themeData.accent
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              
              <Button
                variant={isFilterOpen ? "secondary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{
                  borderColor: themeData.accent,
                  color: themeData.textColor || 'white'
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  size="sm"
                  style={{
                    color: themeData.textColor || 'white'
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>
            
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="mb-6">
              <CollapsibleContent className="border-t border-accent pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{color: themeData.textColor || 'white'}}>Уровень</h4>
                    <div className="flex flex-wrap gap-2">
                      {allLevels.map((level) => (
                        <Badge
                          key={level}
                          variant={activeLevel.includes(level) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleLevel(level)}
                          style={{
                            backgroundColor: activeLevel.includes(level) ? getBadgeColor(level) : 'transparent',
                            borderColor: getBadgeColor(level),
                            color: activeLevel.includes(level) ? 'white' : themeData.textColor || 'white'
                          }}
                        >
                          {level === 0 ? "Заговор" : `${level} уровень`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{color: themeData.textColor || 'white'}}>Школа магии</h4>
                    <div className="flex flex-wrap gap-2">
                      {allSchools.map((school) => (
                        <Badge
                          key={school}
                          variant={activeSchool.includes(school) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSchool(school)}
                          style={{
                            backgroundColor: activeSchool.includes(school) ? getSchoolBadgeColor(school) : 'transparent',
                            borderColor: getSchoolBadgeColor(school),
                            color: activeSchool.includes(school) ? 'white' : themeData.textColor || 'white'
                          }}
                        >
                          {school}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{color: themeData.textColor || 'white'}}>Класс</h4>
                    <div className="flex flex-wrap gap-2">
                      {allClasses.map((className) => (
                        <Badge
                          key={className}
                          variant={activeClass.includes(className) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleClass(className)}
                          style={{
                            backgroundColor: activeClass.includes(className) ? themeData.accent : 'transparent',
                            borderColor: themeData.accent,
                            color: activeClass.includes(className) ? 'white' : themeData.textColor || 'white'
                          }}
                        >
                          {className}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <SpellList 
              spells={filteredSpells}
              getBadgeColor={getBadgeColor}
              getSchoolBadgeColor={getSchoolBadgeColor}
              currentTheme={themeData}
              handleOpenSpell={handleOpenSpell}
              formatClasses={formatClasses}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Модальное окно для просмотра заклинания */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-[700px] border-accent"
          style={{
            backgroundColor: themeData.cardBackground || 'rgba(0, 0, 0, 0.9)',
            color: themeData.textColor || 'white'
          }}
        >
          {selectedSpell && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-xl" style={{color: themeData.textColor || 'white'}}>
                    {selectedSpell.name}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: getBadgeColor(selectedSpell.level),
                      color: 'white',
                      borderColor: getBadgeColor(selectedSpell.level)
                    }}
                  >
                    {selectedSpell.level === 0 ? "Заговор" : `${selectedSpell.level} уровень`}
                  </Badge>
                </div>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: themeData.textColor || 'white',
                        borderColor: getSchoolBadgeColor(selectedSpell.school)
                      }}
                    >
                      {selectedSpell.school}
                    </Badge>
                    {selectedSpell.ritual && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: themeData.textColor || 'white',
                          borderColor: themeData.accent
                        }}
                      >
                        Ритуал
                      </Badge>
                    )}
                    {selectedSpell.concentration && (
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: themeData.textColor || 'white',
                          borderColor: themeData.accent
                        }}
                      >
                        Концентрация
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                <div>
                  <span className="font-semibold">Время накладывания:</span> {selectedSpell.castingTime}
                </div>
                <div>
                  <span className="font-semibold">Дистанция:</span> {selectedSpell.range}
                </div>
                <div>
                  <span className="font-semibold">Компоненты:</span> {selectedSpell.components}
                </div>
                <div>
                  <span className="font-semibold">Длительность:</span> {selectedSpell.duration}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Классы:</span> {formatClasses(selectedSpell.classes)}
                </div>
              </div>
              
              <ScrollArea className="max-h-[400px] mt-4">
                <div className="text-sm whitespace-pre-line" style={{color: themeData.textColor || 'white'}}>
                  {selectedSpell.description}
                </div>
                
                {selectedSpell.higherLevels && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">На более высоких уровнях:</h4>
                    <div className="text-sm whitespace-pre-line" style={{color: themeData.textColor || 'white'}}>
                      {selectedSpell.higherLevels}
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  style={{
                    borderColor: themeData.accent,
                    color: themeData.textColor || 'white'
                  }}
                  onClick={handleClose}
                >
                  Закрыть
                </Button>
                <Button
                  style={{
                    backgroundColor: themeData.accent,
                    color: 'white'
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить в книгу
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Модальное окно для импорта заклинаний */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent
          className="sm:max-w-[700px] border-accent"
          style={{
            backgroundColor: themeData.cardBackground || 'rgba(0, 0, 0, 0.9)',
            color: themeData.textColor || 'white'
          }}
        >
          <DialogHeader>
            <DialogTitle style={{color: themeData.textColor || 'white'}}>
              Импорт заклинаний
            </DialogTitle>
            <DialogDescription>
              Вставьте текст с описаниями заклинаний для импорта.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Label htmlFor="import-text" style={{color: themeData.textColor || 'white'}}>
              Текст для импорта
            </Label>
            <Textarea
              id="import-text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="mt-2"
              placeholder="Вставьте текст заклинаний сюда..."
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: themeData.textColor || 'white',
                borderColor: themeData.accent
              }}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              style={{
                borderColor: themeData.accent,
                color: themeData.textColor || 'white'
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleImportSpells}
              style={{
                backgroundColor: themeData.accent,
                color: 'white'
              }}
            >
              <Upload className="h-4 w-4 mr-1" />
              Импортировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpellBookViewer;
