
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Filter, Wand2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NavigationButtons } from '@/components/ui/NavigationButtons';

// Примитивный набор заклинаний для демонстрации
const DEMO_SPELLS = [
  { id: 1, name: 'Волшебная стрела', level: 1, school: 'Воплощение', castingTime: '1 действие', range: '120 футов', components: 'В, С', duration: 'Мгновенная' },
  { id: 2, name: 'Огненный шар', level: 3, school: 'Воплощение', castingTime: '1 действие', range: '150 футов', components: 'В, С, М', duration: 'Мгновенная' },
  { id: 3, name: 'Лечение ран', level: 1, school: 'Воплощение', castingTime: '1 действие', range: 'Касание', components: 'В, С', duration: 'Мгновенная' },
  { id: 4, name: 'Обнаружение магии', level: 1, school: 'Прорицание', castingTime: '1 действие (ритуал)', range: 'На себя', components: 'В, С', duration: 'Концентрация, до 10 минут' },
];

const SpellbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  
  console.log("SpellbookPage rendering");

  // Фильтрация заклинаний по поисковому запросу и фильтрам
  const filteredSpells = DEMO_SPELLS.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || spell.level.toString() === levelFilter;
    const matchesSchool = schoolFilter === 'all' || spell.school === schoolFilter;
    
    return matchesSearch && matchesLevel && matchesSchool;
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme} p-4`}>
      <div className="container mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/')} size="icon">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wand2 className="size-6" />
              Книга заклинаний D&D 5e
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Боковая панель с фильтрами */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск заклинания..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1">
                  <Filter className="size-4" />
                  Фильтры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Уровень</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите уровень" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все уровни</SelectItem>
                      <SelectItem value="0">Заговор</SelectItem>
                      <SelectItem value="1">1 уровень</SelectItem>
                      <SelectItem value="2">2 уровень</SelectItem>
                      <SelectItem value="3">3 уровень</SelectItem>
                      <SelectItem value="4">4 уровень</SelectItem>
                      <SelectItem value="5">5 уровень</SelectItem>
                      <SelectItem value="6">6 уровень</SelectItem>
                      <SelectItem value="7">7 уровень</SelectItem>
                      <SelectItem value="8">8 уровень</SelectItem>
                      <SelectItem value="9">9 уровень</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Школа магии</label>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите школу" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все школы</SelectItem>
                      <SelectItem value="Воплощение">Воплощение</SelectItem>
                      <SelectItem value="Вызов">Вызов</SelectItem>
                      <SelectItem value="Иллюзия">Иллюзия</SelectItem>
                      <SelectItem value="Некромантия">Некромантия</SelectItem>
                      <SelectItem value="Ограждение">Ограждение</SelectItem>
                      <SelectItem value="Очарование">Очарование</SelectItem>
                      <SelectItem value="Преобразование">Преобразование</SelectItem>
                      <SelectItem value="Прорицание">Прорицание</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <NavigationButtons className="flex-col" />
          </div>
          
          {/* Основной контент - список заклинаний */}
          <div className="space-y-4">
            {filteredSpells.length > 0 ? (
              filteredSpells.map(spell => (
                <Card key={spell.id} className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle>{spell.name}</CardTitle>
                    <CardDescription>
                      {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`} • {spell.school}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Время накладывания:</span> {spell.castingTime}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Дистанция:</span> {spell.range}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Компоненты:</span> {spell.components}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Длительность:</span> {spell.duration}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-card/30 backdrop-blur-sm rounded-lg border border-primary/20">
                <p className="text-lg font-medium">Заклинания не найдены</p>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellbookPage;
