import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Book, X, Bookmark, BookmarkCheck } from "lucide-react";
import { useSpellbook } from '@/hooks/spellbook';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/hooks/spellbook/types'; // Import SpellData from our types
import SpellImporter from './SpellImporter';

const SpellBookViewer: React.FC = () => {
  const { 
    allSpells, 
    filteredSpells, 
    searchTerm, 
    setSearchTerm, 
    levelFilters, 
    schoolFilters, 
    classFilters, 
    toggleFilter,
    extractClasses,
    formatClasses
  } = useSpellbook();

  // Change type to SpellData | null to match what we're passing to it
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  
  // Получаем все доступные школы магии
  const schools = React.useMemo(() => {
    const uniqueSchools = new Set<string>();
    allSpells.forEach(spell => {
      if (spell.school) uniqueSchools.add(spell.school);
    });
    return Array.from(uniqueSchools).sort();
  }, [allSpells]);
  
  // Получаем все доступные классы
  const classes = React.useMemo(() => extractClasses(), [extractClasses]);
  
  // Получаем статистику по заклинаниям по уровням
  const spellCountByLevel = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) {
      counts[i] = allSpells.filter(spell => spell.level === i).length;
    }
    return counts;
  }, [allSpells]);

  return (
    <div className="container mx-auto p-4">
      <Card className="border-accent w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              <Book className="mr-2 h-6 w-6" /> 
              Книга заклинаний
            </CardTitle>
            <CardDescription>
              Всего заклинаний: {allSpells.length}, отображается: {filteredSpells.length}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImporter(true)}>
              Импорт заклинаний
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="browse">Просмотр</TabsTrigger>
              <TabsTrigger value="filters">Фильтры</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Найти заклинание..."
                  className="pl-8 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-2 top-2.5"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <Badge
                    key={level}
                    variant={levelFilters.includes(level) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('level', level)}
                  >
                    {level === 0 ? "Заговоры" : `Уровень ${level}`} ({spellCountByLevel[level]})
                  </Badge>
                ))}
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpells.map(spell => (
                    <Card 
                      key={spell.name} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedSpell(spell)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{spell.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{spell.school}</Badge>
                          <span>{spell.level === 0 ? "Заговор" : `${spell.level} уровень`}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 text-sm">
                        <p className="line-clamp-2">{spell.description?.substring(0, 100)}...</p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredSpells.length === 0 && (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-muted-foreground">Заклинания не найдены</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Уровень заклинания</h3>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <Badge
                        key={level}
                        variant={levelFilters.includes(level) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('level', level)}
                      >
                        {level === 0 ? "Заговоры" : `${level}`} ({spellCountByLevel[level]})
                      </Badge>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Школа магии</h3>
                  <div className="flex flex-wrap gap-2">
                    {schools.map(school => (
                      <Badge
                        key={school}
                        variant={schoolFilters.includes(school) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('school', school)}
                      >
                        {school}
                      </Badge>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Класс персонажа</h3>
                  <div className="flex flex-wrap gap-2">
                    {classes.map(characterClass => (
                      <Badge
                        key={characterClass}
                        variant={classFilters.includes(characterClass) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter('class', characterClass)}
                      >
                        {characterClass}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Диалог с детальной информацией о заклинании */}
      <Dialog 
        open={!!selectedSpell} 
        onOpenChange={(open) => !open && setSelectedSpell(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedSpell && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center justify-between">
                  {selectedSpell.name}
                  <Badge variant="outline" className="ml-2">
                    {selectedSpell.level === 0 ? "Заговор" : `${selectedSpell.level} уровень`}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p><strong>Школа:</strong> {selectedSpell.school}</p>
                  <p><strong>Время накладывания:</strong> {selectedSpell.castingTime}</p>
                  <p><strong>Дистанция:</strong> {selectedSpell.range}</p>
                  <p><strong>Компоненты:</strong> {selectedSpell.components}</p>
                  <p><strong>Длительность:</strong> {selectedSpell.duration}</p>
                </div>
                <div>
                  <p>
                    <strong>Классы:</strong> {formatClasses(selectedSpell.classes)}
                  </p>
                  <p>
                    <strong>Ритуал:</strong> {selectedSpell.ritual ? "Да" : "Нет"}
                  </p>
                  <p>
                    <strong>Концентрация:</strong> {selectedSpell.concentration ? "Да" : "Нет"}
                  </p>
                  <p>
                    <strong>Вербальный компонент:</strong> {selectedSpell.verbal ? "Да" : "Нет"}
                  </p>
                  <p>
                    <strong>Соматический компонент:</strong> {selectedSpell.somatic ? "Да" : "Нет"}
                  </p>
                  <p>
                    <strong>Материальный компонент:</strong> {selectedSpell.material ? "Да" : "Нет"}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Описание:</h4>
                <p className="text-sm">{selectedSpell.description}</p>
                
                {selectedSpell.higherLevels && (
                  <div className="mt-2">
                    <h4 className="font-semibold">На больших уровнях:</h4>
                    <p className="text-sm">{selectedSpell.higherLevels}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Компонент для импорта заклинаний */}
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <SpellImporter 
            onClose={() => setShowImporter(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
