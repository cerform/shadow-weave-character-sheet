
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Plus, Users, Book, BookOpen, User, Swords, Home, UserPlus, FileText, Crown, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import PdfCharacterImport from "@/components/character-import/PdfCharacterImport";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/contexts/CharacterContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { characters, getUserCharacters, setCharacter } = useCharacter();
  
  const [pdfImportDialogOpen, setPdfImportDialogOpen] = useState(false);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);

  // Загружаем персонажей пользователя при изменении авторизации или списка персонажей
  useEffect(() => {
    console.log("Index: Обновляем список персонажей");
    
    if (isAuthenticated) {
      const chars = getUserCharacters();
      console.log("Index: Персонажи пользователя", chars);
      setUserCharacters(chars);
    } else {
      // Если пользователь не аутентифицирован, просто берем все персонажи из localStorage
      console.log("Index: Персонажи из localStorage", characters);
      setUserCharacters(characters);
    }
  }, [isAuthenticated, getUserCharacters, characters]);

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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white text-shadow-lg">Dungeons & Dragons 5e</h1>
          <h2 className="text-2xl text-white text-shadow mb-4">Создай своего героя</h2>
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
              <p className="font-medium text-lg mb-1 text-white text-shadow">
                {currentUser?.username}
                {currentUser?.isDM && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                    Мастер
                  </span>
                )}
              </p>
              <p className="text-sm text-white/80 mb-3 text-shadow-sm">{currentUser?.email}</p>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1 bg-black/50 text-white hover:bg-white/20 border-white/30">
                <LogOut className="h-3.5 w-3.5" />
                Выйти
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} className="flex items-center gap-2 bg-primary text-white hover:bg-primary/80">
              <LogIn className="h-4 w-4" />
              Войти в аккаунт
            </Button>
          )}
        </div>

        <main className="max-w-6xl mx-auto">
          {/* Заголовки разделов в одну строку с отступами */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
            <h3 className="text-2xl font-bold text-white text-shadow">Игрок</h3>
            <h3 className="text-2xl font-bold text-white text-shadow mt-6 md:mt-0">Мастер Подземелий</h3>
          </div>
          
          {/* Основная сетка карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Колонка игрока */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-shadow">
                    <User className="size-5" />
                    Персонаж
                  </CardTitle>
                  <CardDescription className="text-white/80 text-shadow-sm">
                    Создайте или управляйте персонажами
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate("/character-creation")} className="w-full gap-2 bg-primary text-white hover:bg-primary/80">
                    <Plus className="size-4" />
                    Создать персонажа
                  </Button>
                  
                  <Button variant="outline" onClick={() => document.getElementById("character-file")?.click()} className="w-full gap-2 bg-black/50 text-white hover:bg-white/20 border-white/30">
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
                    className="w-full gap-2 bg-black/50 text-white hover:bg-white/20 border-white/30"
                  >
                    <FileUp className="size-4" />
                    Импорт из PDF
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-shadow">
                    <Swords className="size-5" />
                    Играть
                  </CardTitle>
                  <CardDescription className="text-white/80 text-shadow-sm">
                    Присоединяйтесь к игровым сессиям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/join")} className="w-full bg-primary text-white hover:bg-primary/80">
                    Присоединиться к сессии
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Колонка мастера */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-shadow">
                    <Users className="size-5" />
                    Управление сессиями
                  </CardTitle>
                  <CardDescription className="text-white/80 text-shadow-sm">
                    Создавайте и управляйте игровыми сессиями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/dm")} className="w-full bg-primary text-white hover:bg-primary/80">
                    Панель мастера
                  </Button>
                </CardContent>
              </Card>

              {/* Две отдельные карточки для Руководства и Книги заклинаний */}
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-shadow">
                    <BookOpen className="size-5" />
                    Руководство игрока
                  </CardTitle>
                  <CardDescription className="text-white/80 text-shadow-sm">
                    Правила и описание мира D&D 5e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/handbook")} className="w-full bg-primary text-white hover:bg-primary/80">
                    Открыть руководство
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-black/50 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-shadow">
                    <Book className="size-5" />
                    Книга заклинаний
                  </CardTitle>
                  <CardDescription className="text-white/80 text-shadow-sm">
                    Полный список заклинаний D&D 5e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/spellbook")} className="w-full bg-primary text-white hover:bg-primary/80">
                    Открыть книгу заклинаний
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Раздел "Недавние персонажи" */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white text-shadow">
              {isAuthenticated ? "Мои персонажи" : "Недавние персонажи"}
            </h3>
            
            {userCharacters && userCharacters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCharacters.map((char) => (
                  <Card 
                    key={char.id} 
                    className="bg-black/50 backdrop-blur-sm hover:bg-black/60 transition-colors cursor-pointer"
                    onClick={() => loadCharacter(char)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${char.name}`} />
                          <AvatarFallback>{char.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-white text-shadow-sm">{char.name}</h4>
                          <p className="text-xs text-white/70 text-shadow-sm">
                            {char.race}, {char.className} {char.level} уровня
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 text-center text-white/80 text-shadow-sm">
                {isAuthenticated ? 
                  "У вас пока нет сохраненных персонажей" : 
                  "Создайте персонажа или войдите в аккаунт, чтобы увидеть своих персонажей"
                }
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-sm text-white/60 text-shadow-sm">
          <p>D&D 5e Character Sheet Creator © 2025</p>
        </footer>
      </div>

      {/* Диалоговое окно для импорта PDF */}
      <Dialog open={pdfImportDialogOpen} onOpenChange={setPdfImportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black/70 text-white border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-white text-shadow">Импорт персонажа из PDF</DialogTitle>
          </DialogHeader>
          <PdfCharacterImport />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
