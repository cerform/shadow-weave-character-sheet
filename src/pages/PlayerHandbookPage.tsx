import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Book,
  Home,
  ArrowLeft,
  BookOpen,
  Search,
  Filter,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CharacterSpell } from '@/types/character';
import { spells, getSpellsByLevel } from '@/data/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const PlayerHandbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedClass, setSelectedClass] = useState('Все');
  const [selectedSchool, setSelectedSchool] = useState('Все');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDescription, setShowDescription] = useState(true);
  const [showComponents, setShowComponents] = useState(true);
  const [showCastingTime, setShowCastingTime] = useState(true);
  const [showRange, setShowRange] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showClasses, setShowClasses] = useState(true);
  const [showHigherLevels, setShowHigherLevels] = useState(true);
  const [showSchool, setShowSchool] = useState(true);

  // Получить список всех школ магии
  const spellSchools = Array.from(new Set(spells.map(spell => spell.school))).sort();
  
  // Получить список всех классов, которые могут использовать заклинания
  const spellClasses = Array.from(
    new Set(spells.flatMap(spell => spell.classes))
  ).sort();

  // Фильтруем заклинания в зависимости от выбранного таба и фильтров
  const getFilteredSpells = () => {
    let filteredSpells = [...spells];
    
    // Фильтр по табу (уровню заклинания)
    if (activeTab !== 'all') {
      const level = parseInt(activeTab);
      filteredSpells = filteredSpells.filter(spell => spell.level === level);
    }
    
    // Применяем поиск по тексту
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredSpells = filteredSpells.filter(spell => {
        // Поиск по имени
        if (spell.name.toLowerCase().includes(searchTermLower)) return true;
        // Поиск по описанию
        if (spell.description.toLowerCase().includes(searchTermLower)) return true;
        // Поиск по школе
        if (spell.school.toLowerCase().includes(searchTermLower)) return true;
        // Поиск по компонентам
        if (spell.components.toLowerCase().includes(searchTermLower)) return true;
        // Поиск по классам
        if (spell.classes.some(cls => cls.toLowerCase().includes(searchTermLower))) return true;
        
        return false;
      });
    }
    
    // Фильтр по классу
    if (selectedClass !== 'Все') {
      filteredSpells = filteredSpells.filter(spell => 
        spell.classes.includes(selectedClass)
      );
    }
    
    // Фильтр по школе магии
    if (selectedSchool !== 'Все') {
      filteredSpells = filteredSpells.filter(spell => 
        spell.school === selectedSchool
      );
    }
    
    // Сортировка результатов
    filteredSpells.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * order;
      } 
      else if (sortBy === 'level') {
        return (a.level - b.level) * order;
      } 
      else if (sortBy === 'school') {
        return a.school.localeCompare(b.school) * order;
      }
      
      return 0;
    });
    
    return filteredSpells;
  };

  const filteredSpells = getFilteredSpells();
  
  // Пагинация
  const totalPages = Math.ceil(filteredSpells.length / itemsPerPage);
  const paginatedSpells = filteredSpells.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Обновляем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedClass, selectedSchool, itemsPerPage]);

  const handleSpellClick = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDrawerOpen(true);
  };

  // Навигация между страницами
  const navigationLinks = [
    { name: "Главная", path: "/", icon: <Home className="h-4 w-4" /> },
    { name: "Руководство", path: "/handbook", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Создание персонажа", path: "/character-creation", icon: <Book className="h-4 w-4" /> },
    { name: "Боевая карта", path: "/dm/battle", icon: <Book className="h-4 w-4" /> }
  ];

  return (
    <div className="container relative pb-10 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={textStyle}>
          <Book className="h-6 w-6" />
          Книга заклинаний D&D 5e
        </h1>
        <p style={mutedTextStyle}>
          Полная библиотека заклинаний мира D&D 5e
        </p>
      </div>

      {/* Улучшенная навигация */}
      <div className="flex gap-2 flex-wrap mb-6">
        {navigationLinks.map((link, index) => (
          <Button 
            key={link.path} 
            variant="outline" 
            onClick={() => navigate(link.path)} 
            className="flex items-center gap-2"
            style={{color: currentTheme.textColor, borderColor: currentTheme.accent}}
          >
            {link.icon}
            {link.name}
          </Button>
        ))}
      </div>

      <div className="lg:grid grid-cols-5 gap-6">
        {/* Основная область с заклинаниями */}
        <div className="col-span-4">
          {/* Фильтры и поиск */}
          <Card className="mb-6" style={cardStyle}>
            <CardHeader>
              <CardTitle style={textStyle}>Поиск заклинаний</CardTitle>
              <CardDescription style={mutedTextStyle}>Фильтрация и сортировка</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4" style={{color: currentTheme.mutedTextColor}} />
                  <Input
                    type="search"
                    placeholder="Поиск заклинаний..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{
                      color: currentTheme.textColor,
                      borderColor: `${currentTheme.accent}50`,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class" className="mb-2 block" style={textStyle}>Класс:</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger style={{
                        color: currentTheme.textColor,
                        borderColor: `${currentTheme.accent}50`,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}>
                        <SelectValue placeholder="Все классы" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: currentTheme.accent
                      }}>
                        <SelectItem value="Все" style={{color: currentTheme.textColor}}>Все классы</SelectItem>
                        {spellClasses.map(cls => (
                          <SelectItem key={cls} value={cls} style={{color: currentTheme.textColor}}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="school" className="mb-2 block" style={textStyle}>Школа магии:</Label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger style={{
                        color: currentTheme.textColor,
                        borderColor: `${currentTheme.accent}50`,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}>
                        <SelectValue placeholder="Все школы" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: currentTheme.accent
                      }}>
                        <SelectItem value="Все" style={{color: currentTheme.textColor}}>Все школы</SelectItem>
                        {spellSchools.map(school => (
                          <SelectItem key={school} value={school} style={{color: currentTheme.textColor}}>{school}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortBy" className="mb-2 block" style={textStyle}>Сортировать по:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger style={{
                        color: currentTheme.textColor,
                        borderColor: `${currentTheme.accent}50`,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}>
                        <SelectValue placeholder="Имени" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: currentTheme.accent
                      }}>
                        <SelectItem value="name" style={{color: currentTheme.textColor}}>Имени</SelectItem>
                        <SelectItem value="level" style={{color: currentTheme.textColor}}>Уровню</SelectItem>
                        <SelectItem value="school" style={{color: currentTheme.textColor}}>Школе магии</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sortOrder" className="mb-2 block" style={textStyle}>Порядок сортировки:</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger style={{
                        color: currentTheme.textColor,
                        borderColor: `${currentTheme.accent}50`,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}>
                        <SelectValue placeholder="По возрастанию" />
                      </SelectTrigger>
                      <SelectContent style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: currentTheme.accent
                      }}>
                        <SelectItem value="asc" style={{color: currentTheme.textColor}}>По возрастанию</SelectItem>
                        <SelectItem value="desc" style={{color: currentTheme.textColor}}>По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Табы с уровнями заклинаний - обновленные стили для лучшей контрастности */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-6 lg:grid-cols-11">
              {['all', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="text-foreground data-[state=inactive]:text-foreground/70"
                  style={{color: currentTheme.textColor}}
                >
                  {tab === 'all' ? 'Все' : 
                   tab === '0' ? 'Заговоры' : 
                   `${tab} круг`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Таблица заклинаний */}
          <Card style={cardStyle}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle style={textStyle}>
                  {activeTab === 'all' 
                    ? 'Все заклинания' 
                    : activeTab === '0' 
                      ? 'Заговоры' 
                      : `Заклинания ${activeTab} круга`}
                </CardTitle>
                <CardDescription style={mutedTextStyle}>
                  Найдено: {filteredSpells.length} заклинаний
                </CardDescription>
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(parseInt(v))}>
                <SelectTrigger className="w-auto" style={{
                  color: currentTheme.textColor,
                  borderColor: `${currentTheme.accent}50`,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}>
                  <SelectValue placeholder="15 на странице" />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderColor: currentTheme.accent
                }}>
                  <SelectItem value="15" style={{color: currentTheme.textColor}}>15 на странице</SelectItem>
                  <SelectItem value="25" style={{color: currentTheme.textColor}}>25 на странице</SelectItem>
                  <SelectItem value="50" style={{color: currentTheme.textColor}}>50 на странице</SelectItem>
                  <SelectItem value="100" style={{color: currentTheme.textColor}}>100 на странице</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border" style={{borderColor: `${currentTheme.accent}30`}}>
                <Table>
                  <TableHeader>
                    <TableRow style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
                      <TableHead className="w-[40%]" style={textStyle}>Название</TableHead>
                      <TableHead className="w-[15%]" style={textStyle}>Уровень</TableHead>
                      <TableHead className="w-[20%] hidden sm:table-cell" style={textStyle}>Школа</TableHead>
                      <TableHead className="hidden lg:table-cell" style={textStyle}>Классы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSpells.length > 0 ? (
                      paginatedSpells.map((spell) => (
                        <TableRow 
                          key={spell.name} 
                          className="cursor-pointer hover:bg-accent/20"
                          onClick={() => handleSpellClick(spell)}
                        >
                          <TableCell className="font-medium" style={textStyle}>{spell.name}</TableCell>
                          <TableCell style={textStyle}>
                            {spell.level === 0 ? 'Заговор' : `${spell.level} круг`}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell" style={textStyle}>{spell.school}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {spell.classes.slice(0, 3).map((cls) => (
                                <Badge key={cls} variant="outline" style={{
                                  color: currentTheme.textColor,
                                  borderColor: currentTheme.accent,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                                }}>
                                  {cls}
                                </Badge>
                              ))}
                              {spell.classes.length > 3 && (
                                <Badge variant="outline" style={{
                                  color: currentTheme.textColor,
                                  borderColor: currentTheme.accent,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                                }}>
                                  +{spell.classes.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6" style={mutedTextStyle}>
                          Заклинания не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Пагинация */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        style={{color: currentTheme.textColor}}
                      />
                    </PaginationItem>
                    
                    {/* Первая страница */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)} style={{color: currentTheme.textColor}}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Многоточие в начале */}
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis style={{color: currentTheme.textColor}} />
                      </PaginationItem>
                    )}
                    
                    {/* Предыдущая страница */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage - 1)} style={{color: currentTheme.textColor}}>
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Текущая страница */}
                    <PaginationItem>
                      <PaginationLink isActive style={{
                        backgroundColor: currentTheme.accent,
                        color: 'black'
                      }}>{currentPage}</PaginationLink>
                    </PaginationItem>
                    
                    {/* Следующая страница */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage + 1)} style={{color: currentTheme.textColor}}>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Многоточие в конце */}
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis style={{color: currentTheme.textColor}} />
                      </PaginationItem>
                    )}
                    
                    {/* Последняя страница */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)} style={{color: currentTheme.textColor}}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        style={{color: currentTheme.textColor}}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель с настройками */}
        <div className="col-span-1 space-y-6 mt-6 lg:mt-0">
          <Card style={cardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={textStyle}>
                <Settings className="h-5 w-5" />
                Настройки отображения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "showDescription", label: "Описание", state: showDescription, setState: setShowDescription },
                { id: "showComponents", label: "Компоненты", state: showComponents, setState: setShowComponents },
                { id: "showCastingTime", label: "Время накладывания", state: showCastingTime, setState: setShowCastingTime },
                { id: "showRange", label: "Дистанция", state: showRange, setState: setShowRange },
                { id: "showDuration", label: "Длительность", state: showDuration, setState: setShowDuration },
                { id: "showClasses", label: "Классы", state: showClasses, setState: setShowClasses },
                { id: "showHigherLevels", label: "На высших уровнях", state: showHigherLevels, setState: setShowHigherLevels },
                { id: "showSchool", label: "Школа магии", state: showSchool, setState: setShowSchool }
              ].map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <Label htmlFor={setting.id} style={textStyle}>{setting.label}</Label>
                  <Switch 
                    id={setting.id} 
                    checked={setting.state} 
                    onCheckedChange={setting.setState}
                    style={{
                      backgroundColor: setting.state ? currentTheme.accent : 'rgba(0, 0, 0, 0.4)'
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card style={cardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={textStyle}>
                <Info className="h-5 w-5" />
                Справка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="schools">
                  <AccordionTrigger style={textStyle}>Школы магии</AccordionTrigger>
                  <AccordionContent style={textStyle}>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Воплощение</strong> - создание энергии и стихийных эффектов</li>
                      <li><strong>Ограждение</strong> - защитные чары и барьеры</li>
                      <li><strong>Преобразование</strong> - изменение свойств существ и предметов</li>
                      <li><strong>Прорицание</strong> - познание тайн и предсказание будущего</li>
                      <li><strong>Вызов</strong> - перемещение существ и предметов между измерениями</li>
                      <li><strong>Некромантия</strong> - манипуляции с жизнью и смертью</li>
                      <li><strong>Иллюзия</strong> - обман чувств и создание фантомов</li>
                      <li><strong>Очарование</strong> - влияние на разум существ</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="components">
                  <AccordionTrigger style={textStyle}>Компоненты заклинаний</AccordionTrigger>
                  <AccordionContent style={textStyle}>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>В (Вербальный)</strong> - требует произношения мистических слов</li>
                      <li><strong>С (Соматический)</strong> - требует особых жестов руками</li>
                      <li><strong>М (Материальный)</strong> - требует особых материальных компонентов</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="classes">
                  <AccordionTrigger style={textStyle}>Классы заклинателей</AccordionTrigger>
                  <AccordionContent style={textStyle}>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Полные заклинатели:</strong> Бард, Волшебник, Жрец, Друид, Чародей, Колдун, Чернокнижник</li>
                      <li><strong>Полузаклинатели:</strong> Паладин, Следопыт</li>
                      <li><strong>Подклассы-заклинатели:</strong> Воин (Мистический Рыцарь), Плут (Мистический Ловкач), Монах (Путь Четырех Стихий)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="rituals">
                  <AccordionTrigger style={textStyle}>Ритуальные заклинания</AccordionTrigger>
                  <AccordionContent style={textStyle}>
                    <p>Заклинания с пометкой "ритуал" можно накладывать без использования ячеек заклинаний, но время накладывания увеличивается на 10 минут. Для этого требуется специальная особенность класса, позволяющая накладывать ритуалы.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="concentration">
                  <AccordionTrigger style={textStyle}>Концентрация</AccordionTrigger>
                  <AccordionContent style={textStyle}>
                    <p>Заклинания, требующие концентрации, прерываются, если вы начинаете концентрироваться на другом заклинании, получаете урон или теряете сознание. Нельзя концентрироваться более чем на одном заклинании одновременно.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
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

      {/* Модальное окно с деталями заклинания */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent style={{backgroundColor: 'rgba(0, 0, 0, 0.85)', borderColor: currentTheme.accent}}>
          <DrawerHeader>
            <DrawerTitle className="text-xl" style={textStyle}>
              {selectedSpell?.name}
              {selectedSpell && (
                <Badge className="ml-2" style={{
                  backgroundColor: currentTheme.accent,
                  color: 'black'
                }}>
                  {selectedSpell.level === 0 ? 'Заговор' : `${selectedSpell.level} круг`}
                </Badge>
              )}
            </DrawerTitle>
            <DrawerDescription className="flex items-center gap-1" style={mutedTextStyle}>
              <span>{selectedSpell?.school}</span>
              {selectedSpell?.ritual && (
                <Badge variant="outline" className="ml-2" style={{
                  color: currentTheme.textColor,
                  borderColor: currentTheme.accent
                }}>
                  Ритуал
                </Badge>
              )}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <div className="grid gap-4 p-2 rounded-md" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
              {showCastingTime && selectedSpell?.castingTime && (
                <div>
                  <h4 className="font-semibold text-sm" style={textStyle}>Время накладывания:</h4>
                  <p className="text-sm" style={mutedTextStyle}>{selectedSpell.castingTime}</p>
                </div>
              )}
              
              {showRange && selectedSpell?.range && (
                <div>
                  <h4 className="font-semibold text-sm" style={textStyle}>Дистанция:</h4>
                  <p className="text-sm" style={mutedTextStyle}>{selectedSpell.range}</p>
                </div>
              )}
              
              {showComponents && selectedSpell?.components && (
                <div>
                  <h4 className="font-semibold text-sm" style={textStyle}>Компоненты:</h4>
                  <p className="text-sm" style={mutedTextStyle}>{selectedSpell.components}</p>
                </div>
              )}
              
              {showDuration && selectedSpell?.duration && (
                <div>
                  <h4 className="font-semibold text-sm" style={textStyle}>Длительность:</h4>
                  <p className="text-sm" style={mutedTextStyle}>
                    {selectedSpell.concentration ? 'Концентрация, ' : ''}
                    {selectedSpell.duration}
                  </p>
                </div>
              )}
            </div>
            
            <Separator className="my-4" style={{backgroundColor: `${currentTheme.accent}50`}} />
            
            {showDescription && selectedSpell?.description && (
              <div className="mb-4 text-sm">
                <p className="whitespace-pre-line" style={textStyle}>{selectedSpell.description}</p>
              </div>
            )}
            
            {showHigherLevels && selectedSpell?.higherLevels && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1" style={textStyle}>На более высоком уровне:</h4>
                <p className="text-sm" style={textStyle}>{selectedSpell.higherLevels}</p>
              </div>
            )}
            
            {showClasses && selectedSpell?.classes && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1" style={textStyle}>Классы:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSpell.classes.map(cls => (
                    <Badge key={cls} variant="outline" style={{
                      color: currentTheme.textColor,
                      borderColor: currentTheme.accent,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    }}>
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" style={{
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}>
                Закрыть
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PlayerHandbookPage;
