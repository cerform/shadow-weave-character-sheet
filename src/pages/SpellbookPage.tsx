
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CharacterSpell } from '@/types/character';

// Импортируем компоненты для отображения заклинаний
import SpellCard from '@/components/spell-detail/SpellCard';
import SpellDetailModal from '@/components/spell-detail/SpellDetailModal';

// Импортируем данные о заклинаниях
import spells from '@/data/spells';

const SpellbookPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Создаем уникальный список классов из всех заклинаний
  const allClasses = ['all', ...new Set(spells.flatMap(spell => spell.classes))].sort();
  
  // Создаем уникальный список школ магии
  const allSchools = ['all', ...new Set(spells.map(spell => spell.school))].sort();
  
  // Фильтруем заклинания по активным фильтрам
  const filteredSpells = spells.filter(spell => {
    // Фильтр по уровню (активная вкладка)
    if (activeTab !== 'all' && spell.level !== parseInt(activeTab, 10)) {
      return false;
    }
    
    // Фильтр по классу
    if (selectedClass !== 'all' && !spell.classes.includes(selectedClass)) {
      return false;
    }
    
    // Фильтр по школе
    if (selectedSchool !== 'all' && spell.school !== selectedSchool) {
      return false;
    }
    
    // Поиск по запросу
    if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Группируем заклинания по уровням для отображения
  const groupedSpellsByLevel: { [key: string]: CharacterSpell[] } = filteredSpells.reduce((acc, spell) => {
    const level = spell.level === 0 ? 'cantrip' : `level-${spell.level}`;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(spell);
    return acc;
  }, {} as { [key: string]: CharacterSpell[] });
  
  // Открыть модальное окно с деталями заклинания
  const openSpellDetail = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };
  
  // Обработка изменения размера экрана для адаптивности
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Верхняя панель с навигацией */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Button>
          <h1 className="text-2xl font-bold">Книга заклинаний</h1>
          <div className="w-[100px]" /> {/* Пустой блок для выравнивания */}
        </div>
        
        {/* Панель фильтров и поиска */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Название заклинания..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Класс</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите класс" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClasses.map(className => (
                      <SelectItem key={className} value={className}>
                        {className === 'all' ? 'Все классы' : className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Школа магии</label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите школу" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSchools.map(school => (
                      <SelectItem key={school} value={school}>
                        {school === 'all' ? 'Все школы' : school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Табы по уровням заклинаний */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="flex-shrink-0">Все</TabsTrigger>
            <TabsTrigger value="0" className="flex-shrink-0">Заговоры</TabsTrigger>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              <TabsTrigger key={level} value={level.toString()} className="flex-shrink-0">
                {level}-й уровень
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Список заклинаний с результатами */}
        <div className="space-y-8">
          {activeTab === 'all' ? (
            // Показываем все уровни с заголовками
            Object.entries(groupedSpellsByLevel)
              .sort(([a], [b]) => {
                if (a === 'cantrip') return -1;
                if (b === 'cantrip') return 1;
                return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]);
              })
              .map(([levelKey, levelSpells]) => {
                const levelName = levelKey === 'cantrip' 
                  ? 'Заговоры' 
                  : `${levelKey.split('-')[1]}-й уровень`;
                
                return levelSpells.length > 0 ? (
                  <div key={levelKey}>
                    <div className="flex items-center mb-2">
                      <h2 className="text-lg font-semibold">{levelName}</h2>
                      <div className="ml-2 flex items-center">
                        <Badge variant="secondary">
                          {levelSpells.length}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {levelSpells.map(spell => (
                        <SpellCard 
                          key={spell.name} 
                          spell={spell}
                          compact={isMobile}
                        />
                      ))}
                    </div>
                  </div>
                ) : null;
              })
          ) : (
            // Показываем только выбранный уровень
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSpells.map(spell => (
                <SpellCard 
                  key={spell.name} 
                  spell={spell}
                  compact={isMobile}
                />
              ))}
            </div>
          )}
          
          {filteredSpells.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mt-4">Нет заклинаний, соответствующих выбранным фильтрам</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('all');
                  setSelectedSchool('all');
                  setActiveTab('all');
                }}
                className="mt-2"
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно с подробной информацией о заклинании */}
      <SpellDetailModal 
        spell={selectedSpell} 
        isOpen={isDetailModalOpen}
        setIsOpen={setIsDetailModalOpen}
      />
    </div>
  );
};

export default SpellbookPage;
