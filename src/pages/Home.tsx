
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Plus, Users, Book, BookOpen, User, Swords, Home as HomeIcon, UserPlus, LogIn, LogOut, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeSelector from "@/components/character-sheet/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import PdfCharacterImport from "@/components/character-import/PdfCharacterImport";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/contexts/CharacterContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSpellDetails } from "@/data/spells";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { characters, getUserCharacters, setCharacter } = useCharacter();
  
  const [pdfImportDialogOpen, setPdfImportDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("player");
  
  // Состояния для заклинаний
  const [spellSearch, setSpellSearch] = useState('');
  const [spellList, setSpellList] = useState<any[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<any[]>([]);
  const [selectedSpellLevels, setSelectedSpellLevels] = useState<Record<string, boolean>>({
    "0": true, "1": true, "2": true, "3": true, "4": true, 
    "5": true, "6": true, "7": true, "8": true, "9": true
  });
  
  // Загружаем персонажей пользователя при изменении авторизации или списка персонажей
  useEffect(() => {
    if (isAuthenticated) {
      const chars = getUserCharacters();
      setUserCharacters(chars);
    } else {
      // Если пользователь не аутентифицирован, просто берем все персонажи из localStorage
      setUserCharacters(characters);
    }
  }, [isAuthenticated, getUserCharacters, characters]);
  
  // Загружаем список заклинаний
  useEffect(() => {
    const loadSpells = async () => {
      try {
        // Импортируем все заклинания из модуля
        const { spells } = await import('@/data/spells');
        setSpellList(spells || []);
        
        // Применяем изначальную фильтрацию
        filterSpells(spells, spellSearch, selectedSpellLevels);
      } catch (error) {
        console.error('Ошибка при загрузке заклинаний:', error);
      }
    };
    
    loadSpells();
  }, []);
  
  // Функция фильтрации заклинаний
  const filterSpells = (spells: any[], search: string, levels: Record<string, boolean>) => {
    if (!spells) return [];
    
    const filtered = spells.filter(spell => {
      // Фильтр по уровню
      if (!levels[spell.level.toString()]) return false;
      
      // Фильтр по поисковому запросу
      if (search && !spell.name.toLowerCase().includes(search.toLowerCase())) return false;
      
      return true;
    });
    
    setFilteredSpells(filtered);
  };
  
  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSpellSearch(searchTerm);
    filterSpells(spellList, searchTerm, selectedSpellLevels);
  };
  
  // Обработчик изменения фильтров по уровню заклинаний
  const handleLevelFilterChange = (level: string, checked: boolean) => {
    const newLevels = { ...selectedSpellLevels, [level]: checked };
    setSelectedSpellLevels(newLevels);
    filterSpells(spellList, spellSearch, newLevels);
  };
  
  // Обработчик выбора всех уровней заклинаний
  const handleSelectAllLevels = (selected: boolean) => {
    const newLevels: Record<string, boolean> = {};
    Object.keys(selectedSpellLevels).forEach(level => {
      newLevels[level] = selected;
    });
    setSelectedSpellLevels(newLevels);
    filterSpells(spellList, spellSearch, newLevels);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement character loading logic
      console.log("Loading character from file:", file.name);
    }
  };

  // Обработка выхода из аккаунта
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Выход выполнен успешно");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  // Загрузка выбранного персонажа
  const loadCharacter = (character: any) => {
    setCharacter(character);
    navigate("/sheet");
  };
  
  // Обработчик создания персонажа с проверкой авторизации
  const handleCreateCharacter = () => {
    // Если пользователь не авторизован, показываем диалог авторизации
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
    } else {
      // Если пользователь авторизован, сразу переходим к созданию
      navigate("/character-creation");
    }
  };
  
  // Обработчик перехода к деталям заклинания
  const handleSpellClick = (spellName: string) => {
    navigate(`/spellbook?spell=${encodeURIComponent(spellName)}`);
  };
  
  // Получение стиля карточки заклинания в зависимости от школы
  const getSpellSchoolStyle = (school: string) => {
    switch (school) {
      case 'Воплощение':
        return 'border-red-500/30';
      case 'Очарование':
        return 'border-pink-500/30';
      case 'Некромантия':
        return 'border-purple-500/30';
      case 'Преобразование':
        return 'border-blue-500/30';
      case 'Прорицание':
        return 'border-cyan-500/30';
      case 'Иллюзия':
        return 'border-teal-500/30';
      case 'Вызов':
        return 'border-amber-500/30';
      case 'Ограждение':
        return 'border-green-500/30';
      default:
        return 'border-gray-500/30';
    }
  };
  
  // Получение бейджа для уровня заклинания
  const getSpellLevelBadge = (level: number) => {
    if (level === 0) return <Badge variant="outline">Заговор</Badge>;
    return <Badge variant="outline">{level} уровень</Badge>;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Dungeons & Dragons 5e</h1>
          <h2 className="text-2xl text-muted-foreground mb-4">Создай своего героя</h2>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </header>
        
        {/* Секция авторизации */}
        <div className="text-center mb-8">
          {isAuthenticated ? (
            <div className="flex flex-col items-center">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username}`} />
                <AvatarFallback>{currentUser?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="font-medium text-lg mb-1">
                {currentUser?.username}
                {currentUser?.isDM && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                    Мастер
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mb-3">{currentUser?.email}</p>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5" />
                Выйти
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Войти в аккаунт
            </Button>
          )}
        </div>

        {/* Вкладки для разделов Игрок/Мастер/Справочник */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="player" className="text-base py-3">
              <User className="mr-2 h-4 w-4" />
              Игрок
            </TabsTrigger>
            <TabsTrigger value="dm" className="text-base py-3">
              <Users className="mr-2 h-4 w-4" />
              Мастер
            </TabsTrigger>
            <TabsTrigger value="handbook" className="text-base py-3">
              <BookOpen className="mr-2 h-4 w-4" />
              Справочник
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Персонаж
                  </CardTitle>
                  <CardDescription>
                    Создайте или управляйте персонажами
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCreateCharacter} className="w-full gap-2">
                    <Plus className="size-4" />
                    Создать персонажа
                  </Button>
                  
                  <Button variant="outline" onClick={() => document.getElementById("character-file")?.click()} className="w-full gap-2">
                    <FileUp className="size-4" />
                    Загрузить персонажа (JSON)
                  </Button>
                  <input
                    type="file"
                    id="character-file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setPdfImportDialogOpen(true)}
                    className="w-full gap-2"
                  >
                    <FileUp className="size-4" />
                    Импорт из PDF
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="size-5" />
                    Играть
                  </CardTitle>
                  <CardDescription>
                    Присоединяйтесь к игровым сессиям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/join")} className="w-full">
                    Присоединиться к сессии
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Раздел "Недавние персонажи" */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {isAuthenticated ? "Мои персонажи" : "Недавние персонажи"}
              </h3>
              
              {userCharacters && userCharacters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCharacters.map((char) => (
                    <Card 
                      key={char.id} 
                      className="bg-card/30 backdrop-blur-sm hover:bg-card/40 transition-colors cursor-pointer"
                      onClick={() => loadCharacter(char)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${char.name}`} />
                            <AvatarFallback>{char.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{char.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {char.race}, {char.className} {char.level} уровня
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 text-center text-muted-foreground">
                  {isAuthenticated ? 
                    "У вас пока нет сохраненных персонажей" : 
                    "Создайте персонажа или войдите в аккаунт, чтобы увидеть своих персонажей"
                  }
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dm" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Управление сессиями
                  </CardTitle>
                  <CardDescription>
                    Создавайте и управляйте игровыми сессиями
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate("/create-session")} className="w-full">
                    Создать новую сессию
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dm-dashboard")} className="w-full">
                    Панель мастера
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="size-5" />
                    Ресурсы Мастера
                  </CardTitle>
                  <CardDescription>
                    Инструменты для ведения игры
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate("/battle")} className="w-full">
                    Боевая карта
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="handbook" className="space-y-8">
            {/* База заклинаний */}
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="size-5" />
                  Книга заклинаний
                </CardTitle>
                <CardDescription>
                  Просмотр и поиск заклинаний D&D 5e
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск заклинаний..."
                      className="pl-8"
                      value={spellSearch}
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Уровни
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuCheckboxItem
                        checked={Object.values(selectedSpellLevels).every(v => v)}
                        onCheckedChange={handleSelectAllLevels}
                        className="justify-center font-medium"
                      >
                        Выбрать все
                      </DropdownMenuCheckboxItem>
                      
                      <DropdownMenuCheckboxItem
                        checked={selectedSpellLevels["0"]}
                        onCheckedChange={(checked) => handleLevelFilterChange("0", checked)}
                      >
                        Заговоры
                      </DropdownMenuCheckboxItem>
                      
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                        <DropdownMenuCheckboxItem
                          key={level}
                          checked={selectedSpellLevels[level.toString()]}
                          onCheckedChange={(checked) => handleLevelFilterChange(level.toString(), checked)}
                        >
                          {level} уровень
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 max-h-[600px] overflow-y-auto">
                  {filteredSpells.slice(0, 20).map((spell, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:bg-primary/5 transition-colors ${getSpellSchoolStyle(spell.school)}`}
                      onClick={() => handleSpellClick(spell.name)}
                    >
                      <CardContent className="p-3">
                        <h3 className="font-medium text-primary mb-1">{spell.name}</h3>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{spell.school}</span>
                          {getSpellLevelBadge(spell.level)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredSpells.length > 20 && (
                    <div className="col-span-full text-center py-4 text-muted-foreground">
                      <p>Показано 20 из {filteredSpells.length} заклинаний</p>
                      <Button variant="link" onClick={() => navigate("/spellbook")}>
                        Показать все заклинания
                      </Button>
                    </div>
                  )}
                  
                  {filteredSpells.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <p>Заклинания с заданными параметрами не найдены</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-0">
                <Button onClick={() => navigate("/spellbook")} variant="outline">
                  Открыть полную книгу заклинаний
                </Button>
              </CardFooter>
            </Card>
            
            {/* Руководство игрока */}
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Руководство игрока
                </CardTitle>
                <CardDescription>
                  Правила и описание мира D&D 5e
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/handbook")} className="w-full">
                  Открыть руководство
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>D&D 5e Character Sheet Creator © 2025</p>
        </footer>
      </div>

      {/* Диалоговое окно для импорта PDF */}
      <Dialog open={pdfImportDialogOpen} onOpenChange={setPdfImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Импорт персонажа из PDF</DialogTitle>
          </DialogHeader>
          <PdfCharacterImport />
        </DialogContent>
      </Dialog>
      
      {/* Диалоговое окно авторизации для создания персонажа */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Авторизация</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="mb-4">Для создания персонажа рекомендуется войти в аккаунт или зарегистрироваться.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setAuthDialogOpen(false);
                navigate("/auth?action=login&redirect=character-creation");
              }}>
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
              <Button variant="outline" onClick={() => {
                setAuthDialogOpen(false);
                navigate("/character-creation");
              }}>
                Продолжить без входа
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
