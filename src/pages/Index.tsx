import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUp, Plus, Users, Book, BookOpen, User, Swords, Home, UserPlus, FileText, Crown, LogIn, LogOut, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { useUserTheme } from "@/hooks/use-user-theme";
import { themes } from "@/lib/themes";
import PdfCharacterImport from "@/components/character-import/PdfCharacterImport";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/contexts/CharacterContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { characters, getUserCharacters, setCharacter, deleteCharacter } = useCharacter();
  
  // Используем тему из хука для получения стилей
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [pdfImportDialogOpen, setPdfImportDialogOpen] = useState(false);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(null);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { character } = useCharacter();
  
  // Загружаем персонажей пользов��теля только при монтировании компонента или изменении авторизации
  useEffect(() => {
    const fetchCharacters = async () => {
      console.log("Index: Загружаем список персонажей");
      
      if (isLoadingCharacters) return; // Предотвращаем повторные запросы
      
      setIsLoadingCharacters(true);
      
      try {
        // Запрашиваем персонажей только при изменении статуса авторизации
        // или при первом рендере
        const chars = await getUserCharacters();
        
        // Проверяем, что полученные данные являются массивом
        if (Array.isArray(chars)) {
          console.log("Index: Персонажи пользователя", chars);
          setUserCharacters(chars);
        } else {
          console.error("Index: getUserCharacters вернул не массив:", chars);
          setUserCharacters([]);
        }
      } catch (error) {
        console.error("Index: Ошибка при получении персонажей:", error);
        setUserCharacters([]);
      } finally {
        setIsLoadingCharacters(false);
        setHasInitialized(true);
      }
    };
    
    // Загружаем персонажей только если пользователь авторизован и компонент еще не инициализирован
    if (isAuthenticated && !hasInitialized) {
      fetchCharacters();
    }
  }, [isAuthenticated, getUserCharacters, hasInitialized, isLoadingCharacters]);

  // Обработчик для принудительного обновления списка персонажей
  const handleRefreshCharacters = useCallback(async () => {
    setIsLoadingCharacters(true);
    try {
      const chars = await getUserCharacters();
      if (Array.isArray(chars)) {
        setUserCharacters(chars);
      }
    } catch (error) {
      console.error("Ошибка при обновлении персонажей:", error);
    } finally {
      setIsLoadingCharacters(false);
    }
  }, [getUserCharacters]);

  // Обновляем список после удаления персонажа
  useEffect(() => {
    if (!isLoadingCharacters && hasInitialized && Array.isArray(characters)) {
      setUserCharacters(characters);
    }
  }, [characters, isLoadingCharacters, hasInitialized]);

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

  // Функция для удаления персонажа
  const handleDeleteCharacter = async (characterId: string) => {
    try {
      setDeletingCharacterId(characterId);
      await deleteCharacter(characterId);
      toast.success("Персонаж успешно удален");
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      toast.error("Не удалось удалить персонажа");
    } finally {
      setDeletingCharacterId(null);
    }
  };

  // Динамические стили для карточек на основе текущей темы
  const cardStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: currentTheme.accent,
    borderWidth: '2px',
    boxShadow: `0 0 20px ${currentTheme.accent}80`,
    transition: 'all 0.3s ease'
  };

  // Стили для кнопок действий
  const primaryButtonStyle = {
    background: `linear-gradient(45deg, ${currentTheme.accent} 0%, ${currentTheme.accent}80 100%)`,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    boxShadow: `0 4px 15px ${currentTheme.accent}50`,
    border: 'none',
    transition: 'all 0.3s ease'
  };

  // Стили для кнопок действий при наведении
  const hoverEffect = {
    transform: 'translateY(-3px)',
    boxShadow: `0 7px 20px ${currentTheme.accent}70`
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${activeTheme || theme || 'default'}`}>
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 text-shadow-lg animate-fade-in">Dungeons & Dragons 5e</h1>
          <h2 className="text-2xl text-muted-foreground mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>Создай своего героя</h2>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </header>
        
        {/* Секция авторизации */}
        <div className="text-center mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
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

        <main className="max-w-6xl mx-auto">
          {/* Заголовки разделов в одну строку с отступами */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <h3 className="text-2xl font-bold">Игрок</h3>
            <h3 className="text-2xl font-bold mt-6 md:mt-0">Мастер Подземелий</h3>
          </div>
          
          {/* Основная сетка карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Колонка игрока */}
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="backdrop-blur-sm transition-shadow hover:shadow-2xl relative overflow-hidden animate-fade-in" 
                style={{...cardStyle, animationDelay: '0.5s'}}
              >
                {/* Добавляем декоративный элемент в углу карточки */}
                <div 
                  className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br" 
                  style={{
                    background: `radial-gradient(circle, ${currentTheme.accent}30 0%, transparent 70%)`,
                    zIndex: 0
                  }}
                ></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Персонаж
                  </CardTitle>
                  <CardDescription>
                    Создайте или управляйте персонажами
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <Button 
                    asChild 
                    className="w-full gap-2 transition-all hover:translate-y-[-3px]"
                    style={primaryButtonStyle}
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = hoverEffect.transform;
                      target.style.boxShadow = hoverEffect.boxShadow;
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = primaryButtonStyle.boxShadow;
                    }}
                  >
                    <Link to="/character-creation">
                      <Plus className="size-4" />
                      Создать персонажа
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("character-file")?.click()} 
                    className="w-full gap-2 border-2 hover:bg-black/50 transition-all hover:translate-y-[-2px]"
                    style={{borderColor: currentTheme.accent}}
                  >
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
                    className="w-full gap-2 border-2 hover:bg-black/50 transition-all hover:translate-y-[-2px]"
                    style={{borderColor: currentTheme.accent}}
                  >
                    <FileUp className="size-4" />
                    Импорт из PDF
                  </Button>
                </CardContent>
              </Card>
              
              <Card 
                className="backdrop-blur-sm transition-shadow hover:shadow-2xl relative overflow-hidden animate-fade-in" 
                style={{...cardStyle, animationDelay: '0.6s'}}
              >
                {/* Добавляем декоративную полосу внизу карточки */}
                <div 
                  className="absolute bottom-0 left-0 h-1 w-full" 
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${currentTheme.accent} 50%, transparent 100%)`,
                    opacity: 0.7
                  }}
                ></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="size-5" />
                    Играть
                  </CardTitle>
                  <CardDescription>
                    Присоединяйтесь к игровым сессиям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full transition-all hover:translate-y-[-3px]"
                    style={primaryButtonStyle}
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = hoverEffect.transform;
                      target.style.boxShadow = hoverEffect.boxShadow;
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = primaryButtonStyle.boxShadow;
                    }}
                  >
                    <Link to="/join">
                      Присоединиться к сессии
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Колонка мастера */}
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="backdrop-blur-sm transition-shadow hover:shadow-2xl relative overflow-hidden animate-fade-in" 
                style={{...cardStyle, animationDelay: '0.7s'}}
              >
                {/* Добавляем световой эффект в верхнем левом углу */}
                <div 
                  className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#ffffff10] to-transparent rounded-full transform translate-x-[-50%] translate-y-[-50%] opacity-30"
                ></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Управление сессиями
                  </CardTitle>
                  <CardDescription>
                    Создавайте и управляйте игровыми сессиями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full transition-all hover:translate-y-[-3px]"
                    style={primaryButtonStyle}
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = hoverEffect.transform;
                      target.style.boxShadow = hoverEffect.boxShadow;
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = primaryButtonStyle.boxShadow;
                    }}
                  >
                    <Link to="/dm">
                      Панель мастера
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Две отдельные карточки для Руководства и Книги заклинаний */}
              <Card 
                className="backdrop-blur-sm transition-shadow hover:shadow-2xl relative overflow-hidden animate-fade-in" 
                style={{...cardStyle, animationDelay: '0.8s'}}
              >
                {/* Декоративный элемент для карточки руководства */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff05] to-transparent opacity-50"></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="size-5" />
                    Руководство игрока
                  </CardTitle>
                  <CardDescription>
                    Правила и описание мира D&D 5e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full transition-all hover:translate-y-[-3px]"
                    style={primaryButtonStyle}
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = hoverEffect.transform;
                      target.style.boxShadow = hoverEffect.boxShadow;
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = primaryButtonStyle.boxShadow;
                    }}
                  >
                    <Link to="/handbook">
                      Открыть руководство
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card 
                className="backdrop-blur-sm transition-shadow hover:shadow-2xl relative overflow-hidden animate-fade-in" 
                style={{...cardStyle, animationDelay: '0.9s'}}
              >
                {/* Добавляем магическую анимацию для книги заклинаний */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br opacity-20"
                    style={{ 
                      background: `radial-gradient(circle at 50% 50%, ${currentTheme.accent}30, transparent 70%)`,
                      animation: 'pulse 3s infinite ease-in-out'
                    }}
                  ></div>
                </div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Book className="size-5" />
                    Книга заклинаний
                  </CardTitle>
                  <CardDescription>
                    Полный список заклинаний D&D 5e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    asChild 
                    className="w-full transition-all hover:translate-y-[-3px]"
                    style={primaryButtonStyle}
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = hoverEffect.transform;
                      target.style.boxShadow = hoverEffect.boxShadow;
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = primaryButtonStyle.boxShadow;
                    }}
                  >
                    <Link to="/spellbook">
                      Открыть книгу заклинаний
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Раздел "Недавние персонажи" */}
          <div className="animate-fade-in" style={{animationDelay: '1s'}}>
            <h3 className="text-xl font-bold mb-4">
              {isAuthenticated ? "Мои персонажи" : "Недавние персонажи"}
            </h3>
            
            {isLoadingCharacters ? (
              <div 
                className="backdrop-blur-sm rounded-lg p-6 text-center text-muted-foreground"
                style={cardStyle}
              >
                Загрузка персонажей...
              </div>
            ) : userCharacters && userCharacters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCharacters.map((char) => (
                  <Card 
                    key={char.id}
                    className="backdrop-blur-sm hover:bg-card/40 transition-all"
                    style={cardStyle}
                  >
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => loadCharacter(char)}>
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
                      
                      {/* Кнопка удаления с диалогом подтверждения */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-70 hover:opacity-100 hover:bg-destructive/20"
                            aria-label="Удалить персонажа"
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить персонажа {char.name}? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteCharacter(char.id)}
                              disabled={deletingCharacterId === char.id}
                            >
                              {deletingCharacterId === char.id ? "Удаление..." : "Удалить"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div 
                className="backdrop-blur-sm rounded-lg p-6 text-center text-muted-foreground"
                style={cardStyle}
              >
                {isAuthenticated ? 
                  "У вас пока нет сохраненных персонажей" : 
                  "Создайте персонажа или войдите в аккаунт, чтобы увидеть своих персонажей"
                }
              </div>
            )}
          </div>
        </main>

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
    </div>
  );
};

export default Index;
