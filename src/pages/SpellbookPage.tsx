
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSpellNames, getSpellDetails } from '@/data/spells';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, BookOpen, Home, ChevronLeft, ChevronRight, X } from 'lucide-react';
import SpellCard from '@/components/spell-detail/SpellCard';
import { CharacterSpell } from '@/types/character';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const SpellbookPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    level: null as number | null,
    school: null as string | null,
    class: null as string | null,
  });
  const [activeTab, setActiveTab] = useState('all');
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  // Стили для текста с улучшенной контрастностью
  const textStyle = { 
    color: currentTheme.textColor,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
  };
  
  const mutedTextStyle = {
    color: currentTheme.mutedTextColor,
    textShadow: '0px 1px 1px rgba(0, 0, 0, 0.4)'
  };
  
  // Стили для карточек
  const cardStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: `${currentTheme.accent}30`
  };
  
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
  
  // Управление выбором уровней заклинаний
  const toggleLevel = (level: number) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
    // Сбросить одиночный фильтр по уровню
    setFilters(prev => ({...prev, level: null}));
    // Установить активную вкладку на "all" при множественном выборе
    if (activeTab !== 'all') {
      setActiveTab('all');
    }
  };
  
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
    
    // Фильтр по выбранным уровням
    if (selectedLevels.length > 0 && !selectedLevels.includes(spell.level)) {
      return false;
    }
    
    // Фильтр по уровню (одиночный)
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
    setSelectedLevels([]);
    setSearchTerm('');
    setActiveTab('all');
  };
  
  // Считаем количество заклинаний для каждого уровня
  const countByLevel = spells.reduce((acc, spell) => {
    acc[spell.level] = (acc[spell.level] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  // Обработчик выбора вкладки по уровню
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== 'all') {
      // При выборе вкладки по уровню, сбрасываем множественный выбор уровней
      setSelectedLevels([]);
    }
  };
  
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={textStyle}>Книга заклинаний</h1>
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
            <Search className="absolute left-2 top-2.5 h-5 w-5" style={{color: currentTheme.mutedTextColor}} />
            <Input
              type="text"
              placeholder="Поиск заклинания..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                color: currentTheme.textColor,
                borderColor: `${currentTheme.accent}50`,
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            style={{
              color: currentTheme.textColor,
              borderColor: currentTheme.accent
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
      
      {/* Отображение текущих фильтров по уровням */}
      {selectedLevels.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span style={textStyle}>Выбранные уровни:</span>
            {selectedLevels.sort((a, b) => a - b).map(level => (
              <Badge 
                key={`selected-${level}`} 
                className="flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.textColor,
                }}
                onClick={() => toggleLevel(level)}
              >
                {level === 0 ? 'Заговор' : `${level} уровень`}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedLevels([])}
              style={{color: currentTheme.accent}}
            >
              Очистить
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="mb-6" style={cardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={textStyle}>
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2" style={textStyle}>Уровень</h3>
                <div className="flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <Badge
                      key={level}
                      className={`cursor-pointer ${
                        selectedLevels.includes(level) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => toggleLevel(level)}
                      style={{
                        backgroundColor: selectedLevels.includes(level) 
                          ? currentTheme.accent 
                          : 'rgba(0, 0, 0, 0.4)',
                        color: currentTheme.textColor,
                      }}
                    >
                      {level === 0 ? 'Заг.' : level}
                      <span className="ml-1 opacity-75">({countByLevel[level] || 0})</span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2" style={textStyle}>Школа магии</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueSchools.map((school) => (
                    <Badge
                      key={school}
                      className={`cursor-pointer ${
                        filters.school === school 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        school: prev.school === school ? null : school
                      }))}
                      style={{
                        backgroundColor: filters.school === school 
                          ? currentTheme.accent 
                          : 'rgba(0, 0, 0, 0.4)',
                        color: currentTheme.textColor,
                      }}
                    >
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2" style={textStyle}>Класс</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueClasses.map((className) => (
                    <Badge
                      key={className}
                      className={`cursor-pointer ${
                        filters.class === className 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => setFilters(prev => ({
                        ...prev, 
                        class: prev.class === className ? null : className
                      }))}
                      style={{
                        backgroundColor: filters.class === className 
                          ? currentTheme.accent 
                          : 'rgba(0, 0, 0, 0.4)',
                        color: currentTheme.textColor,
                      }}
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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4" style={{borderColor: `${currentTheme.accent}50`}}>
              {['all', '0', '1', '2', '3', '4', '5'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  style={{color: currentTheme.textColor}}
                >
                  {tab === 'all' ? 'Все' : 
                   tab === '0' ? 'Заговоры' : 
                   tab === '5' ? '5+' : 
                   `${tab}-й`}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={textStyle}>
                    <BookOpen className="h-5 w-5" />
                    {activeTab === 'all' 
                      ? (selectedLevels.length > 0 
                          ? `Заклинания (уровни: ${selectedLevels.sort((a, b) => a - b).join(', ')})` 
                          : 'Все заклинания')
                      : activeTab === '0' 
                        ? 'Заговоры' 
                        : `Заклинания ${activeTab}-го уровня`}
                  </div>
                  <span className="text-sm font-normal" style={mutedTextStyle}>
                    {filteredSpells.length} заклинаний
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSpells.length === 0 ? (
                  <div className="py-8 text-center">
                    <p style={mutedTextStyle}>Заклинания не найдены</p>
                    <Button 
                      variant="link" 
                      onClick={resetFilters}
                      className="mt-2"
                      style={{color: currentTheme.accent}}
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

      {/* Навигационные кнопки внизу */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/handbook')} 
          className="flex items-center gap-2"
          style={{color: currentTheme.textColor, borderColor: currentTheme.accent}}
        >
          <ChevronLeft className="h-4 w-4" />
          Руководство игрока
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/character-creation')} 
          className="flex items-center gap-2"
          style={{color: currentTheme.textColor, borderColor: currentTheme.accent}}
        >
          Создание персонажа
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SpellbookPage;
