
import React, { useState, useEffect } from 'react';
import { getAllSpells } from '@/data/spells';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Book } from "lucide-react";
import { CharacterSpell } from '@/types/character';

const SpellBookViewer: React.FC = () => {
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка заклинаний
  useEffect(() => {
    try {
      const loadedSpells = getAllSpells();
      console.log('Загружено заклинаний:', loadedSpells.length);
      setSpells(loadedSpells);
      setFilteredSpells(loadedSpells);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке заклинаний:', error);
      setIsLoading(false);
    }
  }, []);

  // Фильтрация заклинаний
  useEffect(() => {
    let result = [...spells];

    // Поиск по тексту
    if (searchTerm) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spell.description && spell.description.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Фильтр по вкладкам (уровням)
    if (activeTab !== 'all') {
      const level = parseInt(activeTab);
      if (!isNaN(level)) {
        result = result.filter(spell => spell.level === level);
      }
    }

    setFilteredSpells(result);
  }, [searchTerm, activeTab, spells]);

  // Получение всех уникальных уровней заклинаний
  const spellLevels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);

  // Обработчик выбора заклинания
  const handleSelectSpell = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
  };

  // Получение цвета бейджа для уровня заклинания
  const getSpellLevelBadge = (level: number) => {
    if (level === 0) return "bg-gray-600 hover:bg-gray-700";
    return `bg-blue-${600 + level * 50} hover:bg-blue-${600 + level * 50 + 100}`;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Поиск заклинаний</CardTitle>
          <CardDescription>Найдите заклинания из Книги игрока D&D 5e</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 opacity-50" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Название заклинания, описание..."
                className="flex-grow"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">Все</TabsTrigger>
                {spellLevels.map((level) => (
                  <TabsTrigger key={`level-${level}`} value={level.toString()}>
                    {level === 0 ? 'Заговоры' : `${level} уровень`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Список заклинаний</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Загрузка заклинаний...</p>
                  </div>
                ) : filteredSpells.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSpells.map((spell) => (
                      <Button
                        key={spell.id || spell.name}
                        variant={selectedSpell?.id === spell.id ? "default" : "outline"}
                        className="w-full justify-between text-left"
                        onClick={() => handleSelectSpell(spell)}
                      >
                        <span>{spell.name}</span>
                        <Badge variant="outline">
                          {spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p>Заклинания не найдены</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedSpell ? selectedSpell.name : "Выберите заклинание"}
              </CardTitle>
              {selectedSpell && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={selectedSpell.level === 0 ? "outline" : "default"}>
                    {selectedSpell.level === 0 ? 'Заговор' : `${selectedSpell.level} уровень`}
                  </Badge>
                  {selectedSpell.school && (
                    <Badge variant="secondary">{selectedSpell.school}</Badge>
                  )}
                  {selectedSpell.classes && Array.isArray(selectedSpell.classes) && 
                    selectedSpell.classes.map((cls, index) => (
                      <Badge key={index} variant="outline">{cls}</Badge>
                    ))
                  }
                  {selectedSpell.classes && !Array.isArray(selectedSpell.classes) && (
                    <Badge variant="outline">{selectedSpell.classes}</Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedSpell ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSpell.castingTime && (
                      <div>
                        <h4 className="font-medium text-sm">Время накладывания:</h4>
                        <p>{selectedSpell.castingTime}</p>
                      </div>
                    )}
                    {selectedSpell.range && (
                      <div>
                        <h4 className="font-medium text-sm">Дистанция:</h4>
                        <p>{selectedSpell.range}</p>
                      </div>
                    )}
                    {selectedSpell.components && (
                      <div>
                        <h4 className="font-medium text-sm">Компоненты:</h4>
                        <p>{selectedSpell.components}</p>
                      </div>
                    )}
                    {selectedSpell.duration && (
                      <div>
                        <h4 className="font-medium text-sm">Длительность:</h4>
                        <p>{selectedSpell.duration}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Описание:</h4>
                    <p className="mt-2 whitespace-pre-line">
                      {selectedSpell.description}
                    </p>
                  </div>
                  {selectedSpell.higherLevels && (
                    <div>
                      <h4 className="font-medium text-sm">На более высоких уровнях:</h4>
                      <p className="mt-2">{selectedSpell.higherLevels}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <Book className="h-12 w-12 mb-4 opacity-30" />
                  <p>Выберите заклинание из списка слева, чтобы увидеть подробное описание</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpellBookViewer;
