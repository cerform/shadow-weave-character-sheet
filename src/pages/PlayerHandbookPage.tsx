
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
  Info
} from "lucide-react";
import { CharacterSpell } from '@/types/character';
import { spells, getSpellsByLevel } from '@/data/spells';

const PlayerHandbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  return (
    <div className="container relative pb-10 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Book className="h-6 w-6" />
          Книга заклинаний D&D 5e
        </h1>
        <p className="text-muted-foreground">
          Полная библиотека заклинаний мира D&D 5e
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          На главную
        </Button>
        <Button variant="outline" onClick={() => navigate('/handbook')} className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Руководство игрока
        </Button>
      </div>

      <div className="lg:grid grid-cols-5 gap-6">
        {/* Основная область с заклинаниями */}
        <div className="col-span-4">
          {/* Фильтры и поиск */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Поиск заклинаний</CardTitle>
              <CardDescription>Фильтрация и сортировка</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск заклинаний..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class" className="mb-2 block">Класс:</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все классы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все классы</SelectItem>
                        {spellClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="school" className="mb-2 block">Школа магии:</Label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все школы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все школы</SelectItem>
                        {spellSchools.map(school => (
                          <SelectItem key={school} value={school}>{school}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortBy" className="mb-2 block">Сортировать по:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Имени" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Имени</SelectItem>
                        <SelectItem value="level">Уровню</SelectItem>
                        <SelectItem value="school">Школе магии</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sortOrder" className="mb-2 block">Порядок сортировки:</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue placeholder="По возрастанию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">По возрастанию</SelectItem>
                        <SelectItem value="desc">По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Табы с уровнями заклинаний */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-6 lg:grid-cols-11">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="0">Заговоры</TabsTrigger>
              <TabsTrigger value="1">1 круг</TabsTrigger>
              <TabsTrigger value="2">2 круг</TabsTrigger>
              <TabsTrigger value="3">3 круг</TabsTrigger>
              <TabsTrigger value="4">4 круг</TabsTrigger>
              <TabsTrigger value="5">5 круг</TabsTrigger>
              <TabsTrigger value="6">6 круг</TabsTrigger>
              <TabsTrigger value="7">7 круг</TabsTrigger>
              <TabsTrigger value="8">8 круг</TabsTrigger>
              <TabsTrigger value="9">9 круг</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Таблица заклинаний */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === 'all' 
                    ? 'Все заклинания' 
                    : activeTab === '0' 
                      ? 'Заговоры' 
                      : `Заклинания ${activeTab} круга`}
                </CardTitle>
                <CardDescription>
                  Найдено: {filteredSpells.length} заклинаний
                </CardDescription>
              </div>
              <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(parseInt(v))}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="15 на странице" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 на странице</SelectItem>
                  <SelectItem value="25">25 на странице</SelectItem>
                  <SelectItem value="50">50 на странице</SelectItem>
                  <SelectItem value="100">100 на странице</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Название</TableHead>
                      <TableHead className="w-[15%]">Уровень</TableHead>
                      <TableHead className="w-[20%] hidden sm:table-cell">Школа</TableHead>
                      <TableHead className="hidden lg:table-cell">Классы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSpells.length > 0 ? (
                      paginatedSpells.map((spell) => (
                        <TableRow 
                          key={spell.name} 
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSpellClick(spell)}
                        >
                          <TableCell className="font-medium">{spell.name}</TableCell>
                          <TableCell>{spell.level === 0 ? 'Заговор' : `${spell.level} круг`}</TableCell>
                          <TableCell className="hidden sm:table-cell">{spell.school}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {spell.classes.slice(0, 3).map((cls) => (
                                <Badge key={cls} variant="outline">{cls}</Badge>
                              ))}
                              {spell.classes.length > 3 && (
                                <Badge variant="outline">+{spell.classes.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
                      />
                    </PaginationItem>
                    
                    {/* Первая страница */}
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Многоточие в начале */}
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Предыдущая страница */}
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Текущая страница */}
                    <PaginationItem>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>
                    
                    {/* Следующая страница */}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {/* Многоточие в конце */}
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {/* Последняя страница */}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Настройки отображения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showDescription">Описание</Label>
                <Switch 
                  id="showDescription" 
                  checked={showDescription} 
                  onCheckedChange={setShowDescription} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showComponents">Компоненты</Label>
                <Switch 
                  id="showComponents" 
                  checked={showComponents} 
                  onCheckedChange={setShowComponents} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCastingTime">Время накладывания</Label>
                <Switch 
                  id="showCastingTime" 
                  checked={showCastingTime} 
                  onCheckedChange={setShowCastingTime} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showRange">Дистанция</Label>
                <Switch 
                  id="showRange" 
                  checked={showRange} 
                  onCheckedChange={setShowRange} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showDuration">Длительность</Label>
                <Switch 
                  id="showDuration" 
                  checked={showDuration} 
                  onCheckedChange={setShowDuration} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showClasses">Классы</Label>
                <Switch 
                  id="showClasses" 
                  checked={showClasses} 
                  onCheckedChange={setShowClasses} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showHigherLevels">На высших уровнях</Label>
                <Switch 
                  id="showHigherLevels" 
                  checked={showHigherLevels} 
                  onCheckedChange={setShowHigherLevels} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showSchool">Школа магии</Label>
                <Switch 
                  id="showSchool" 
                  checked={showSchool} 
                  onCheckedChange={setShowSchool} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Справка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="schools">
                  <AccordionTrigger>Школы магии</AccordionTrigger>
                  <AccordionContent>
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
                  <AccordionTrigger>Компоненты заклинаний</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>В (Вербальный)</strong> - требует произношения мистических слов</li>
                      <li><strong>С (Соматический)</strong> - требует особых жестов руками</li>
                      <li><strong>М (Материальный)</strong> - требует особых материальных компонентов</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="classes">
                  <AccordionTrigger>Классы заклинателей</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Полные заклинатели:</strong> Бард, Волшебник, Жрец, Друид, Чародей, Колдун, Чернокнижник</li>
                      <li><strong>Полузаклинатели:</strong> Паладин, Следопыт</li>
                      <li><strong>Подклассы-заклинатели:</strong> Воин (Мистический Рыцарь), Плут (Мистический Ловкач), Монах (Путь Четырех Стихий)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="rituals">
                  <AccordionTrigger>Ритуальные заклинания</AccordionTrigger>
                  <AccordionContent>
                    <p>Заклинания с пометкой "ритуал" можно накладывать без использования ячеек заклинаний, но время накладывания увеличивается на 10 минут. Для этого требуется специальная особенность класса, позволяющая накладывать ритуалы.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="concentration">
                  <AccordionTrigger>Концентрация</AccordionTrigger>
                  <AccordionContent>
                    <p>Заклинания, требующие концентрации, прерываются, если вы начинаете концентрироваться на другом заклинании, получаете урон или теряете сознание. Нельзя концентрироваться более чем на одном заклинании одновременно.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно с деталями заклинания */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xl">
              {selectedSpell?.name}
              {selectedSpell && <Badge className="ml-2">{selectedSpell.level === 0 ? 'Заговор' : `${selectedSpell.level} круг`}</Badge>}
            </DrawerTitle>
            <DrawerDescription className="flex items-center gap-1">
              <span>{selectedSpell?.school}</span>
              {selectedSpell?.ritual && <Badge variant="outline" className="ml-2">Ритуал</Badge>}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <div className="grid gap-4 p-2 rounded-md bg-background/50">
              {showCastingTime && selectedSpell?.castingTime && (
                <div>
                  <h4 className="font-semibold text-sm">Время накладывания:</h4>
                  <p className="text-muted-foreground text-sm">{selectedSpell.castingTime}</p>
                </div>
              )}
              
              {showRange && selectedSpell?.range && (
                <div>
                  <h4 className="font-semibold text-sm">Дистанция:</h4>
                  <p className="text-muted-foreground text-sm">{selectedSpell.range}</p>
                </div>
              )}
              
              {showComponents && selectedSpell?.components && (
                <div>
                  <h4 className="font-semibold text-sm">Компоненты:</h4>
                  <p className="text-muted-foreground text-sm">{selectedSpell.components}</p>
                </div>
              )}
              
              {showDuration && selectedSpell?.duration && (
                <div>
                  <h4 className="font-semibold text-sm">Длительность:</h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedSpell.concentration ? 'Концентрация, ' : ''}
                    {selectedSpell.duration}
                  </p>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {showDescription && selectedSpell?.description && (
              <div className="mb-4 text-sm">
                <p className="whitespace-pre-line">{selectedSpell.description}</p>
              </div>
            )}
            
            {showHigherLevels && selectedSpell?.higherLevels && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">На более высоком уровне:</h4>
                <p className="text-sm">{selectedSpell.higherLevels}</p>
              </div>
            )}
            
            {showClasses && selectedSpell?.classes && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Классы:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSpell.classes.map(cls => (
                    <Badge key={cls} variant="outline">{cls}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Закрыть</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PlayerHandbookPage;
