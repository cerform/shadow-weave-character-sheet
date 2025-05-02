
import React, { useState, useEffect } from 'react';
import { getAllSpellNames, getSpellDetails } from '@/data/spells';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, BookOpen } from 'lucide-react';
import SpellCard from '@/components/spell-detail/SpellCard';
import { CharacterSpell } from '@/types/character';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';

const SpellbookPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [filters, setFilters] = useState({
    level: null as number | null,
    school: null as string | null,
    class: null as string | null,
  });
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // Загружаем все заклинания при монтировании компонента
    const allSpellNames = getAllSpellNames();
    const loadedSpells = allSpellNames.map(name => {
      const details = getSpellDetails(name);
      return {
        name,
        level: details?.level || 0,
        school: details?.school || '',
        castingTime: details?.castingTime || '',
        range: details?.range || '',
        components: details?.components || '',
        duration: details?.duration || '',
        description: details?.description || '',
        higherLevels: details?.higherLevels || '',
        classes: details?.classes || [],
        ritual: (details?.components || '').includes('Р'),
        concentration: (details?.duration || '').includes('концентрация'),
      };
    });
    
    setSpells(loadedSpells);
  }, []);
  
  // Фильтрация заклинаний
  const filteredSpells = spells.filter(spell => {
    // Поиск по тексту
    if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Фильтр по активной вкладке (уровню)
    if (activeTab !== 'all') {
      const tabLevel = parseInt(activeTab);
      if (spell.level !== tabLevel) {
        return false;
      }
    }
    
    // Фильтр по уровню
    if (filters.level !== null && spell.level !== filters.level) {
      return false;
    }
    
    // Фильтр по школе магии
    if (filters.school && spell.school !== filters.school) {
      return false;
    }
    
    // Фильтр по классу
    if (filters.class && !spell.classes.includes(filters.class)) {
      return false;
    }
    
    return true;
  });
  
  // Получаем все уникальные школы магии и классы для фильтров
  const uniqueSchools = Array.from(new Set(spells.map(spell => spell.school))).sort();
  const uniqueClasses = Array.from(new Set(spells.flatMap(spell => spell.classes))).sort();
  
  // Обработчик сброса фильтров
  const resetFilters = () => {
    setFilters({
      level: null,
      school: null,
      class: null,
    });
    setSearchTerm('');
  };
  
  // Считаем количество заклинаний для каждого уровня
  const countByLevel = spells.reduce((acc, spell) => {
    acc[spell.level] = (acc[spell.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Книга заклинаний</h1>
        <div className="flex gap-2">
          <ThemeSelector />
        </div>
      </div>
      
      <div className="mb-6">
        <NavigationButtons />
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск заклинания..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="text-primary-foreground border-primary"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="mb-6 border border-primary/30 bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Уровень</h3>
                <div className="flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <Badge
                      key={level}
                      className={`cursor-pointer ${
                        filters.level === level 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80 text-white'
                      }`}
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        level: prev.level === level ? null : level
                      }))}
                    >
                      {level === 0 ? 'Заг.' : level}
                      <span className="ml-1 opacity-75">({countByLevel[level] || 0})</span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Школа магии</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueSchools.map((school) => (
                    <Badge
                      key={school}
                      className={`cursor-pointer ${
                        filters.school === school 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80 text-white'
                      }`}
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        school: prev.school === school ? null : school
                      }))}
                    >
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Класс</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueClasses.map((className) => (
                    <Badge
                      key={className}
                      className={`cursor-pointer ${
                        filters.class === className 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80 text-white'
                      }`}
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        class: prev.class === className ? null : className
                      }))}
                    >
                      {className}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 border-primary/30">
              <TabsTrigger value="all" className="text-primary-foreground">Все</TabsTrigger>
              <TabsTrigger value="0" className="text-primary-foreground">Заговоры</TabsTrigger>
              <TabsTrigger value="1" className="text-primary-foreground">1-й</TabsTrigger>
              <TabsTrigger value="2" className="text-primary-foreground">2-й</TabsTrigger>
              <TabsTrigger value="3" className="text-primary-foreground">3-й</TabsTrigger>
              <TabsTrigger value="4" className="text-primary-foreground">4-й</TabsTrigger>
              <TabsTrigger value="5" className="text-primary-foreground">5+</TabsTrigger>
            </TabsList>
            
            <Card className="border-primary/30 bg-background/80">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {activeTab === 'all' 
                      ? 'Все заклинания' 
                      : activeTab === '0' 
                        ? 'Заговоры' 
                        : `Заклинания ${activeTab}-го уровня`}
                  </div>
                  <span className="text-sm font-normal">
                    {filteredSpells.length} заклинаний
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSpells.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Заклинания не найдены</p>
                    <Button 
                      variant="link" 
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Сбросить фильтры
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSpells.map(spell => (
                      <SpellCard 
                        key={spell.name} 
                        spell={spell} 
                        compact 
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SpellbookPage;
