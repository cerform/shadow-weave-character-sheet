import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileUp, Plus, Users, Book, BookOpen, User, Swords, 
  Home as HomeIcon, UserPlus, LogIn, LogOut, Search, Filter, 
  Edit, Download, Upload, Dices, Info, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { themes } from "@/lib/themes";

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { characters, getUserCharacters, setCharacter } = useCharacter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Проверка прав пользователя
  const isDM = currentUser?.isDM || false;
  
  const [pdfImportDialogOpen, setPdfImportDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  
  // Определяем, какая вкладка должна быть активна по умолчанию
  // Если пользователь не авторизован, показываем только вкладку "Справочник"
  const getDefaultTab = () => {
    if (!isAuthenticated) return "handbook";
    return "player"; // Авторизованным пользователям показываем вкладку "Игрок"
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  
  // Состояния для заклинаний
  const [spellSearch, setSpellSearch] = useState('');
  const [spellList, setSpellList] = useState<any[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<any[]>([]);
  const [selectedSpellLevels, setSelectedSpellLevels] = useState<Record<string, boolean>>({
    "0": true, "1": true, "2": true, "3": true, "4": true, 
    "5": true, "6": true, "7": true, "8": true, "9": true
  });

  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Получаем список персонажей пользователя
  const fetchUserCharacters = async () => {
    try {
      const characters = await getUserCharacters();
      setUserCharacters(characters);
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
    }
  };

  // Загружаем персонажей пользователя при изменении авторизации или списка персонажей
  useEffect(() => {
    fetchUserCharacters();
  }, [isAuthenticated, getUserCharacters, characters]);
  
  // При изменении статуса авторизации проверяем, нужно ли сменить активную вкладку
  useEffect(() => {
    // Если пользователь не авторизован и активна защищённая вкладка
    if (!isAuthenticated && (activeTab === "player" || activeTab === "dm")) {
      setActiveTab("handbook");
    }
  }, [isAuthenticated, activeTab]);
  
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

  // Обработчики Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, target: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragTarget(target);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setDragTarget(null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, target: string) => {
    e.preventDefault();
    setIsDragging(false);
    setDragTarget(null);
    
    // Проверяем авторизацию перед обработкой файлов
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (target === 'json') {
        // Обработка JSON файла
        if (file.type === 'application/json') {
          handleJsonFileImport(file);
        } else {
          toast.error("Неве��ный формат файла. Пожалуйста, загрузите JSON файл.");
        }
      } else if (target === 'pdf') {
        // Обработка PDF файла
        if (file.type === 'application/pdf') {
          setPdfImportDialogOpen(true);
          // В PdfCharacterImport компоненте нужно реализовать функционал приема файла напрямую
        } else {
          toast.error("Неверный формат файла. Пожалуйста, загрузите PDF файл.");
        }
      }
    }
  };

  const handleJsonFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const character = JSON.parse(e.target?.result as string);
        // Здесь можно добавить валидацию JSON
        console.log("Загружен персонаж из JSON:", character);
        toast.success("Персонаж успешно импортирован");
      } catch (error) {
        console.error("Ошибка при парсинге JSON:", error);
        toast.error("Ошибка при импорте персонажа");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Проверка авторизации перед загрузкой файла
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    
    const file = event.target.files?.[0];
    if (file) {
      handleJsonFileImport(file);
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
  
  // Обработчик присоединения к сессии с проверкой авторизации
  const handleJoinSession = () => {
    // Если пользователь не авторизован, показываем диалог авторизации
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
    } else {
      // Если пользователь авторизован, сразу переходим к соединению
      navigate("/join");
    }
  };
  
  // Обработчик перехода к деталям заклинания
  const handleSpellClick = (spellName: string) => {
    navigate(`/spellbook?spell=${encodeURIComponent(spellName)}`);
  };
  
  // Обработчик перехода на страницу профиля
  const handleProfileEdit = () => {
    navigate("/profile");
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

  // Background image style with animation
  const backgroundImageStyle = {
    backgroundImage: 'url(https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=2300&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    opacity: 0.15,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    animation: 'slowPulse 15s infinite alternate',
  };

  // Добавляем анимацию для фона
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slowPulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme} relative overflow-x-hidden`}>
      {/* Анимированный фон */}
      <div style={backgroundImageStyle}></div>
      
      <div className="container px-4 py-8 mx-auto relative z-10">
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
              <div 
                className="mb-2 p-1 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${currentTheme.accent}, ${currentTheme.accent}90)`,
                  boxShadow: `0 0 15px ${currentTheme.accent}70`
                }}
              >
                <Avatar className="h-20 w-20 border-2 border-background">
                  <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username}`} />
                  <AvatarFallback>{currentUser?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-col items-center mb-3">
                <button 
                  onClick={() => handleProfileEdit()}
                  className="font-medium text-lg mb-1 hover:underline transition-all flex items-center gap-1"
                >
                  {currentUser?.username}
                  <Edit className="ml-1 h-3.5 w-3.5 opacity-70" />
                </button>
                
                {currentUser?.isDM && (
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                    Мастер
                  </span>
                )}
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                  <LogOut className="h-3.5 w-3.5" />
                  Выйти
                </Button>
                <Button variant="outline" size="sm" onClick={handleProfileEdit} className="flex items-center gap-1">
                  <Edit className="h-3.5 w-3.5" />
                  Профиль
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} className="flex items-center gap-2" 
              style={{backgroundColor: currentTheme.accent}}>
              <LogIn className="h-4 w-4" />
              Войти в аккаунт
            </Button>
          )}
        </div>

        {/* Вкладки для разделов Игрок/Мастер/Справочник */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8 relative overflow-hidden">
            {/* Вкладка Игрок - доступна только авторизованным пользователям */}
            <TabsTrigger 
              value="player" 
              className={`text-base py-3 relative ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={!isAuthenticated}
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  setAuthDialogOpen(true);
                }
              }}
            >
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Игрок
                {!isAuthenticated && <Lock className="ml-2 h-3 w-3 opacity-70" />}
              </div>
              
              {activeTab === 'player' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full animate-fade-in" 
                  style={{ backgroundColor: currentTheme.accent }}
                ></span>
              )}
            </TabsTrigger>
            
            {/* Вкладка Мастер - доступна только авторизованным пользователям с правами мастера */}
            <TabsTrigger 
              value="dm" 
              className={`text-base py-3 relative ${!(isAuthenticated && isDM) ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={!(isAuthenticated && isDM)}
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  setAuthDialogOpen(true);
                }
              }}
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Мастер
                {(!isAuthenticated || !isDM) && <Lock className="ml-2 h-3 w-3 opacity-70" />}
              </div>
              
              {activeTab === 'dm' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full animate-fade-in" 
                  style={{ backgroundColor: currentTheme.accent }}
                ></span>
              )}
            </TabsTrigger>
            
            {/* Вкладка Справочник - доступна всем пользователям */}
            <TabsTrigger value="handbook" className="text-base py-3 relative">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Справочник
              </div>
              
              {activeTab === 'handbook' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full animate-fade-in" 
                  style={{ backgroundColor: currentTheme.accent }}
                ></span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Контент вкладки Игрок - отображается только авторизованным пользователям */}
          {isAuthenticated && (
            <TabsContent value="player" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card 
                  className={`bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-102 overflow-hidden`}
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    boxShadow: `0 0 15px ${currentTheme.accent}20`,
                  }}
                >
                  <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full" 
                        style={{ backgroundColor: `${currentTheme.accent}30` }}
                      >
                        <User className="size-5" style={{ color: currentTheme.accent }} />
                      </div>
                      <span>Персонаж</span>
                    </CardTitle>
                    <CardDescription>
                      Создайте или управляйте персонажами
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleCreateCharacter} 
                      className="w-full gap-2 hover:scale-102 transition-transform"
                      style={{backgroundColor: currentTheme.accent}}
                    >
                      <Plus className="size-4" />
                      Создать персонажа
                    </Button>
                    
                    {/* JSON импорт с поддержкой drag-n-drop */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                        dragTarget === 'json' ? 'bg-primary/10 border-primary' : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, 'json')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleFileDrop(e, 'json')}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Download className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Перетащите JSON файл персо��ажа сюда</p>
                      <p className="text-xs text-muted-foreground">или нажмите, чтобы выбрать файл</p>
                      <input
                        type="file"
                        id="character-file"
                        accept=".json"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    {/* PDF импорт с поддержкой drag-n-drop */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                        dragTarget === 'pdf' ? 'bg-primary/10 border-primary' : 'border-muted hover:border-muted-foreground/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, 'pdf')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleFileDrop(e, 'pdf')}
                      onClick={() => setPdfImportDialogOpen(true)}
                    >
                      <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Перетащите PDF-лист персонажа сюда</p>
                      <p className="text-xs text-muted-foreground">или нажмите, чтобы импортировать PDF</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-102 overflow-hidden`}
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    boxShadow: `0 0 15px ${currentTheme.accent}20`,
                  }}
                >
                  <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full" 
                        style={{ backgroundColor: `${currentTheme.accent}30` }}
                      >
                        <Swords className="size-5" style={{ color: currentTheme.accent }} />
                      </div>
                      <span>Играть</span>
                    </CardTitle>
                    <CardDescription>
                      Присоединяйтесь к игровым сессиям
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleJoinSession}
                      className="w-full hover:scale-102 transition-transform"
                      style={{backgroundColor: currentTheme.accent}}
                    >
                      <Dices className="mr-2 h-4 w-4" />
                      Присоединиться к сессии
                    </Button>
                    
                    <div className="p-4 rounded-lg bg-background/40">
                      <h4 className="font-medium mb-2">Как присоединиться к игре?</h4>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Создайте персонажа</li>
                        <li>Получите код сессии у Мастера</li>
                        <li>Введите код и присоединитесь</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Раздел "Недавние персонажи" с улучшенным дизайном */}
              <div className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">{isAuthenticated ? "Мои персонажи" : "Недавние персонажи"}</span>
                  <Badge variant="outline" className="font-normal">
                    {userCharacters?.length || 0}
                  </Badge>
                </h3>
                
                {userCharacters && userCharacters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCharacters.map((char) => (
                      <Card 
                        key={char.id} 
                        className="bg-card/20 backdrop-blur-sm hover:bg-card/40 hover:scale-102 transition-all cursor-pointer rounded-xl border"
                        style={{
                          borderColor: `${currentTheme.accent}30`,
                        }}
                        onClick={() => loadCharacter(char)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-14 w-14 border-2" style={{borderColor: currentTheme.accent}}>
                              <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${char.name}`} />
                              <AvatarFallback>{char.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{char.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {char.race}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{
                                    borderColor: currentTheme.accent,
                                    backgroundColor: `${currentTheme.accent}20`
                                  }}
                                >
                                  {char.className} {char.level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="bg-card/20 backdrop-blur-sm rounded-2xl p-8 text-center border"
                    style={{
                      borderColor: `${currentTheme.accent}30`,
                    }}
                  >
                    <div className="mb-4">
                      <Dices className="mx-auto h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">У вас пока нет сохраненных персонажей</h3>
                    <p className="text-muted-foreground mb-4">
                      Создайте своего первого героя и отправляйтесь в путешествие!
                    </p>
                    <Button 
                      onClick={handleCreateCharacter}
                      style={{backgroundColor: currentTheme.accent}}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Создать нового героя
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Контент вкладки Мастер - отображается только авторизованным пользователям с правами мастера */}
          {isAuthenticated && isDM && (
            <TabsContent value="dm" className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card 
                  className="bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-102 overflow-hidden"
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    boxShadow: `0 0 15px ${currentTheme.accent}20`,
                  }}
                >
                  <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full" 
                        style={{ backgroundColor: `${currentTheme.accent}30` }}
                      >
                        <Users className="size-5" style={{ color: currentTheme.accent }} />
                      </div>
                      <span>Управление сессиями</span>
                    </CardTitle>
                    <CardDescription>
                      Создавайте и управляйте игровыми сессиями
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => navigate("/create-session")} 
                      className="w-full hover:scale-102 transition-transform"
                      style={{backgroundColor: currentTheme.accent}}
                    >
                      Создать новую сессию
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/dm-dashboard")} 
                      className="w-full"
                    >
                      Панель мастера
                    </Button>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-102 overflow-hidden"
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    boxShadow: `0 0 15px ${currentTheme.accent}20`,
                  }}
                >
                  <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-full" 
                        style={{ backgroundColor: `${currentTheme.accent}30` }}
                      >
                        <Book className="size-5" style={{ color: currentTheme.accent }} />
                      </div>
                      <span>Ресурсы Мастера</span>
                    </CardTitle>
                    <CardDescription>
                      Инструменты для ведения игры
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => navigate("/battle")} 
                      className="w-full hover:scale-102 transition-transform"
                      style={{backgroundColor: currentTheme.accent}}
                    >
                      Боевая карта
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Вкладка справочника - доступна всем пользователям */}
          <TabsContent value="handbook" className="space-y-8 animate-fade-in">
            {/* Информация для неавторизованных пользователей */}
            {!isAuthenticated && (
              <div className="bg-card/20 backdrop-blur-sm border rounded-2xl mb-8 transition-all duration-300 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-full" 
                    style={{ backgroundColor: `${currentTheme.accent}30` }}
                  >
                    <Info className="size-5" style={{ color: currentTheme.accent }} />
                  </div>
                  <div>
                    <h3 className="font-medium">Добро пожаловать в D&D 5e</h3>
                    <p className="text-sm text-muted-foreground">Чтобы получить полный доступ к приложению, войдите в аккаунт</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate("/auth")} 
                  variant="outline"
                  className="text-sm"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти или создать аккаунт
                </Button>
              </div>
            )}
            
            {/* База заклинаний */}
            <Card 
              className="bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg overflow-hidden"
              style={{
                borderColor: `${currentTheme.accent}40`,
                boxShadow: `0 0 15px ${currentTheme.accent}20`,
              }}
            >
              <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-full" 
                    style={{ backgroundColor: `${currentTheme.accent}30` }}
                  >
                    <Book className="size-5" style={{ color: currentTheme.accent }} />
                  </div>
                  <span>Книга заклинаний</span>
                </CardTitle>
                <CardDescription>
                  Просмотр и поиск заклина��ий D&D 5e
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
                  
                  <TooltipProvider>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Filter className="h-4 w-4" />
                              Уровни
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          Фильтр заклинаний по уровню
                        </TooltipContent>
                      </Tooltip>
                      
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
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 max-h-[600px] overflow-y-auto">
                  {filteredSpells.slice(0, 20).map((spell, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:bg-primary/5 hover:scale-102 transition-all ${getSpellSchoolStyle(spell.school)}`}
                      onClick={() => handleSpellClick(spell.name)}
                    >
                      <CardContent className="p-3">
                        <h3 className="font-medium text-primary mb-1" style={{color: currentTheme.accent}}>{spell.name}</h3>
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
                <Button 
                  onClick={() => navigate("/spellbook")} 
                  variant="outline"
                  className="hover:scale-102 transition-transform"
                >
                  Открыть полную книгу заклинаний
                </Button>
              </CardFooter>
            </Card>
            
            {/* Руководство игрока */}
            <Card 
              className="bg-card/20 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-102 overflow-hidden"
              style={{
                borderColor: `${currentTheme.accent}40`,
                boxShadow: `0 0 15px ${currentTheme.accent}20`,
              }}
            >
              <CardHeader className="bg-gradient-to-r from-transparent to-background/20">
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-full" 
                    style={{ backgroundColor: `${currentTheme.accent}30` }}
                  >
                    <BookOpen className="size-5" style={{ color: currentTheme.accent }} />
                  </div>
                  <span>Руководство игрока</span>
                </CardTitle>
                <CardDescription>
                  Правила и описание мира D&D 5e
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/handbook")} 
                  className="w-full hover:scale-102 transition-transform"
                  style={{backgroundColor: currentTheme.accent}}
                >
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
            <p className="mb-4">Для доступа к этому разделу необходимо войти в аккаунт или зарегистрироваться.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setAuthDialogOpen(false);
                navigate("/auth?action=login");
              }}>
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
              <Button variant="outline" onClick={() => {
                setAuthDialogOpen(false);
              }}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
