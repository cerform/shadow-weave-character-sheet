import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ModeToggle"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  CardArrowRight,
  Github,
  Heart,
  LucideIcon,
  MessageSquare,
  Plus,
  Settings,
  Twitter,
  User,
} from "lucide-react"
import { InputWithButton } from "@/components/forms/input-with-button"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import { DashboardHeader } from "@/components/header"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Search } from "lucide-react"
import { CharacterSpell } from '@/types/character';
import { spells } from '@/data/spells';

const PlayerHandbookPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedLevel, setSelectedLevel] = useState('Все');
  const [selectedClass, setSelectedClass] = useState('Все');
  const [selectedSchool, setSelectedSchool] = useState('Все');
  const [showDescription, setShowDescription] = useState(true);
  const [showComponents, setShowComponents] = useState(true);
  const [showCastingTime, setShowCastingTime] = useState(true);
  const [showRange, setShowRange] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showClasses, setShowClasses] = useState(true);
  const [showHigherLevels, setShowHigherLevels] = useState(true);
  const [showSchool, setShowSchool] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const toggleDescription = () => setShowDescription(!showDescription);
  const toggleComponents = () => setShowComponents(!showComponents);
  const toggleCastingTime = () => setShowCastingTime(!showCastingTime);
  const toggleRange = () => setShowRange(!showRange);
  const toggleDuration = () => setShowDuration(!showDuration);
  const toggleClasses = () => setShowClasses(!showClasses);
  const toggleHigherLevels = () => setShowHigherLevels(!showHigherLevels);
  const toggleSchool = () => setShowSchool(!showSchool);

  const handleSpellClick = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const filteredSpells = spells ? spells.filter(spell => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameMatches = spell.name.toLowerCase().includes(searchTermLower);
    const descriptionMatches = spell.description.toLowerCase().includes(searchTermLower);
    const componentsMatches = spell.components.toLowerCase().includes(searchTermLower);
    const castingTimeMatches = spell.castingTime.toLowerCase().includes(searchTermLower);
    const rangeMatches = spell.range.toLowerCase().includes(searchTermLower);
    const durationMatches = spell.duration.toLowerCase().includes(searchTermLower);
    const classesMatches = spell.classes.some(c => c.toLowerCase().includes(searchTermLower));
    const higherLevelsMatches = spell.higherLevels?.toLowerCase().includes(searchTermLower);
    const schoolMatches = spell.school.toLowerCase().includes(searchTermLower);

    const categoryMatches = selectedCategory === 'Все' ||
      (selectedCategory === 'name' && nameMatches) ||
      (selectedCategory === 'description' && descriptionMatches) ||
      (selectedCategory === 'components' && componentsMatches) ||
      (selectedCategory === 'castingTime' && castingTimeMatches) ||
      (selectedCategory === 'range' && rangeMatches) ||
      (selectedCategory === 'duration' && durationMatches) ||
      (selectedCategory === 'classes' && classesMatches) ||
      (selectedCategory === 'higherLevels' && higherLevelsMatches) ||
      (selectedCategory === 'school' && schoolMatches);

    const levelMatches = selectedLevel === 'Все' || spell.level.toString() === selectedLevel;
    const classMatches = selectedClass === 'Все' || spell.classes.includes(selectedClass);
    const schoolMatchesFilter = selectedSchool === 'Все' || spell.school === selectedSchool;

    return categoryMatches && levelMatches && classMatches && schoolMatchesFilter;
  }) : [];

  const sortedSpells = [...filteredSpells].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * order;
    } else if (sortBy === 'level') {
      return (a.level - b.level) * order;
    } else if (sortBy === 'school') {
      return a.school.localeCompare(b.school) * order;
    }
    return 0;
  });

  const spellLevels = [...new Set(spells ? spells.map(spell => spell.level.toString()) : [])];
  const spellClasses = [...new Set(spells ? spells.flatMap(spell => spell.classes) : [])];
  const spellSchools = [...new Set(spells ? spells.map(spell => spell.school) : [])];

  return (
    <>
      <div className="md:hidden">
        <DashboardHeader
          heading="Player Handbook"
          text="Spells, Items, Monsters and more"
        />
      </div>
      <div className="hidden md:block">
        <DashboardHeader
          heading="Player Handbook"
          text="Spells, Items, Monsters and more"
        />
      </div>
      <div className="container relative pb-10">
        <div className="lg:grid grid-cols-5 gap-4">
          <div className="col-span-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Поиск</CardTitle>
                <CardDescription>Поиск заклинаний</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="search" className="text-right">
                      Поиск:
                    </Label>
                    <Input
                      type="search"
                      id="search"
                      placeholder="Поиск..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Категория:
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все</SelectItem>
                        <SelectItem value="name">Название</SelectItem>
                        <SelectItem value="description">Описание</SelectItem>
                        <SelectItem value="components">Компоненты</SelectItem>
                        <SelectItem value="castingTime">Время накладывания</SelectItem>
                        <SelectItem value="range">Дистанция</SelectItem>
                        <SelectItem value="duration">Длительность</SelectItem>
                        <SelectItem value="classes">Классы</SelectItem>
                        <SelectItem value="higherLevels">На более высоких уровнях</SelectItem>
                        <SelectItem value="school">Школа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="level" className="text-right">
                      Уровень:
                    </Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все</SelectItem>
                        {spellLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="class" className="text-right">
                      Класс:
                    </Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все</SelectItem>
                        {spellClasses.map(className => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="school" className="text-right">
                      Школа:
                    </Label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Все">Все</SelectItem>
                        {spellSchools.map(school => (
                          <SelectItem key={school} value={school}>{school}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="sort" className="text-right">
                      Сортировать по:
                    </Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Название" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Название</SelectItem>
                        <SelectItem value="level">Уровень</SelectItem>
                        <SelectItem value="school">Школа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="order" className="text-right">
                      Порядок:
                    </Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="По возрастанию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">По возрастанию</SelectItem>
                        <SelectItem value="desc">По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Заклинания</CardTitle>
                <CardDescription>Список заклинаний</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="description" checked={showDescription} onCheckedChange={toggleDescription} />
                    <Label htmlFor="description">Описание</Label>
                    <Switch id="components" checked={showComponents} onCheckedChange={toggleComponents} />
                    <Label htmlFor="components">Компоненты</Label>
                    <Switch id="castingTime" checked={showCastingTime} onCheckedChange={toggleCastingTime} />
                    <Label htmlFor="castingTime">Время накладывания</Label>
                    <Switch id="range" checked={showRange} onCheckedChange={toggleRange} />
                    <Label htmlFor="range">Дистанция</Label>
                    <Switch id="duration" checked={showDuration} onCheckedChange={toggleDuration} />
                    <Label htmlFor="duration">Длительность</Label>
                    <Switch id="classes" checked={showClasses} onCheckedChange={toggleClasses} />
                    <Label htmlFor="classes">Классы</Label>
                    <Switch id="higherLevels" checked={showHigherLevels} onCheckedChange={toggleHigherLevels} />
                    <Label htmlFor="higherLevels">На более высоких уровнях</Label>
                    <Switch id="school" checked={showSchool} onCheckedChange={toggleSchool} />
                    <Label htmlFor="school">Школа</Label>
                  </div>
                  <div className="relative">
                    {spells && spells.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Уровень</TableHead>
                            <TableHead className="hidden md:table-cell">Школа</TableHead>
                            <TableHead className="hidden md:table-cell">Классы</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {spells && spells.map((spell) => (
                            <TableRow key={spell.name} onClick={() => handleSpellClick(spell)} className="cursor-pointer hover:bg-secondary">
                              <TableCell>{spell.name}</TableCell>
                              <TableCell>{spell.level}</TableCell>
                              <TableCell className="hidden md:table-cell">{spell.school}</TableCell>
                              <TableCell className="hidden md:table-cell">{spell.classes.join(', ')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-4 text-center text-muted-foreground">
                        Нет заклинаний
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Настройки</CardTitle>
                <CardDescription>Настройки отображения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="description" checked={showDescription} onCheckedChange={toggleDescription} />
                    <Label htmlFor="description">Описание</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="components" checked={showComponents} onCheckedChange={toggleComponents} />
                    <Label htmlFor="components">Компоненты</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="castingTime" checked={showCastingTime} onCheckedChange={toggleCastingTime} />
                    <Label htmlFor="castingTime">Время накладывания</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="range" checked={showRange} onCheckedChange={toggleRange} />
                    <Label htmlFor="range">Дистанция</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="duration" checked={showDuration} onCheckedChange={toggleDuration} />
                    <Label htmlFor="duration">Длительность</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="classes" checked={showClasses} onCheckedChange={toggleClasses} />
                    <Label htmlFor="classes">Классы</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="higherLevels" checked={showHigherLevels} onCheckedChange={toggleHigherLevels} />
                    <Label htmlFor="higherLevels">На более высоких уровнях</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="school" checked={showSchool} onCheckedChange={toggleSchool} />
                    <Label htmlFor="school">Школа</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedSpell?.name}</DrawerTitle>
            <DrawerDescription>
              {selectedSpell?.school}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            {selectedSpell && (
              <>
                {showDescription && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Описание:</h4>
                    <p className="text-sm">{selectedSpell.description}</p>
                  </div>
                )}
                {showComponents && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Компоненты:</h4>
                    <p className="text-sm">{selectedSpell.components}</p>
                  </div>
                )}
                {showCastingTime && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Время накладывания:</h4>
                    <p className="text-sm">{selectedSpell.castingTime}</p>
                  </div>
                )}
                {showRange && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Дистанция:</h4>
                    <p className="text-sm">{selectedSpell.range}</p>
                  </div>
                )}
                {showDuration && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Длительность:</h4>
                    <p className="text-sm">{selectedSpell.duration}</p>
                  </div>
                )}
                {showClasses && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Классы:</h4>
                    <p className="text-sm">{selectedSpell.classes.join(', ')}</p>
                  </div>
                )}
                {showHigherLevels && selectedSpell.higherLevels && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">На более высоких уровнях:</h4>
                    <p className="text-sm">{selectedSpell.higherLevels}</p>
                  </div>
                )}
                {showSchool && (
                  <div className="mb-2">
                    <h4 className="text-sm font-bold">Школа:</h4>
                    <p className="text-sm">{selectedSpell.school}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose>Закрыть</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PlayerHandbookPage;
