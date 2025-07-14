import React, { useState, useCallback, useMemo } from 'react';
import { Search, BookOpen, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CharacterSpell } from '@/types/character';
import { spells as spellsData } from '@/data/spells';

const FloatingSpellWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  
  // Получаем все заклинания
  const allSpells = useMemo(() => {
    return spellsData || [];
  }, []);

  // Фильтрация заклинаний по поисковому запросу
  const filteredSpells = useMemo(() => {
    if (!searchQuery.trim()) return allSpells.slice(0, 20); // Показываем первые 20 если нет поиска
    
    const query = searchQuery.toLowerCase().trim();
    return allSpells.filter(spell => {
      const description = Array.isArray(spell.description) ? spell.description.join(' ') : spell.description;
      return spell.name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);
    }).slice(0, 10); // Ограничиваем результаты
  }, [searchQuery, allSpells]);

  const handleSpellSelect = useCallback((spell: CharacterSpell) => {
    setSelectedSpell(spell);
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedSpell(null);
  }, []);

  const getSchoolColor = (school: string) => {
    const colors: Record<string, string> = {
      'Воплощение': 'bg-red-500/20 text-red-300',
      'Ограждение': 'bg-blue-500/20 text-blue-300',
      'Очарование': 'bg-pink-500/20 text-pink-300',
      'Прорицание': 'bg-purple-500/20 text-purple-300',
      'Вызов': 'bg-green-500/20 text-green-300',
      'Некромантия': 'bg-gray-500/20 text-gray-300',
      'Преобразование': 'bg-orange-500/20 text-orange-300',
      'Иллюзия': 'bg-indigo-500/20 text-indigo-300'
    };
    return colors[school] || 'bg-gray-500/20 text-gray-300';
  };

  const formatSpellLevel = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <BookOpen className="h-6 w-6" />
      </Button>

      {/* Виджет поиска заклинаний */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-black/95 border-purple-500/30">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-purple-300">
              <Sparkles className="h-5 w-5" />
              Поиск заклинаний
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[60vh]">
            {/* Левая панель - поиск и список */}
            <div className="flex-1 border-r border-gray-700">
              {/* Поиск */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Введите название заклинания..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Список заклинаний */}
              <ScrollArea className="h-full">
                <div className="p-2">
                  {filteredSpells.map((spell) => (
                    <Card
                      key={spell.id}
                      className={`mb-2 cursor-pointer transition-all hover:bg-purple-900/30 ${
                        selectedSpell?.id === spell.id ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-900/50 border-gray-700'
                      }`}
                      onClick={() => handleSpellSelect(spell)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-1">{spell.name}</h3>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {formatSpellLevel(spell.level)}
                              </Badge>
                              {spell.school && (
                                <Badge variant="outline" className={`text-xs ${getSchoolColor(spell.school)}`}>
                                  {spell.school}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {(() => {
                                const description = Array.isArray(spell.description) ? spell.description.join(' ') : spell.description;
                                return description.substring(0, 100) + '...';
                              })()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredSpells.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Заклинания не найдены</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Правая панель - детали заклинания */}
            <div className="flex-1 bg-gray-900/50">
              {selectedSpell ? (
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedSpell.name}</h2>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-purple-600 text-white">
                          {formatSpellLevel(selectedSpell.level)}
                        </Badge>
                        {selectedSpell.school && (
                          <Badge className={getSchoolColor(selectedSpell.school)}>
                            {selectedSpell.school}
                          </Badge>
                        )}
                        {selectedSpell.ritual && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            Ритуал
                          </Badge>
                        )}
                        {selectedSpell.concentration && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            Концентрация
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Основные характеристики */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div>
                        <span className="text-gray-400">Время сотворения:</span>
                        <p className="text-white">{selectedSpell.castingTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Дистанция:</span>
                        <p className="text-white">{selectedSpell.range}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Компоненты:</span>
                        <p className="text-white">{selectedSpell.components}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Длительность:</span>
                        <p className="text-white">{selectedSpell.duration}</p>
                      </div>
                    </div>

                    {/* Описание */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Описание</h3>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {Array.isArray(selectedSpell.description) 
                          ? selectedSpell.description.join('\n\n') 
                          : selectedSpell.description}
                      </div>
                    </div>

                    {/* Классы */}
                    {selectedSpell.classes && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Доступно классам</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(selectedSpell.classes) 
                            ? selectedSpell.classes 
                            : [selectedSpell.classes]
                          ).map((className, index) => (
                            <Badge key={index} variant="outline" className="text-green-400 border-green-400">
                              {className}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Выберите заклинание для просмотра деталей</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Кнопка закрытия */}
          <Button
            onClick={closeWidget}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingSpellWidget;