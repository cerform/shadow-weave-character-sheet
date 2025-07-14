import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookMarked, BookOpen, Users, Shield, UserPlus, Swords 
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import { logCharacterSystemDiagnostics } from '@/utils/characterDiagnostics';

const HomePage = () => {
  // Выполняем диагностику при загрузке главной страницы
  useEffect(() => {
    logCharacterSystemDiagnostics();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-philosopher">
                D&D Character Manager
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Создавайте персонажей, управляйте сессиями и погружайтесь в мир приключений
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Session Management */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-philosopher">
            Управление сессиями
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-lg border-primary/30 bg-card/80 backdrop-blur-sm hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl text-foreground">
                  Стать Мастером
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Создайте новую сессию и управляйте игрой
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Создавайте сессии, приглашайте игроков и управляйте игровым процессом
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/dm">
                    <Shield className="mr-2 h-5 w-5" />
                    Панель Мастера
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-secondary/30 bg-card/80 backdrop-blur-sm hover:shadow-secondary/10 hover:border-secondary/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <CardTitle className="text-2xl text-foreground">
                  Присоединиться к игре
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Войдите в существующую сессию как игрок
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Введите код сессии и присоединяйтесь к приключению с друзьями
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                  <Link to="/session">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Присоединиться
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Characters Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-philosopher">
            Управление персонажами
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="shadow-lg border-accent/30 bg-card/80 backdrop-blur-sm hover:shadow-accent/10 hover:border-accent/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Swords className="h-12 w-12 mx-auto mb-4 text-accent" />
                <CardTitle className="text-2xl text-foreground">
                  Создать персонажа
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Создайте нового героя для ваших приключений
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link to="/character-creation">
                    <Swords className="mr-2 h-5 w-5" />
                    Создать
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-muted/30 bg-card/80 backdrop-blur-sm hover:shadow-muted/10 hover:border-muted/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="text-2xl text-foreground">
                  Мои персонажи
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Просмотрите всех созданных персонажей
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-muted-foreground text-muted-foreground hover:bg-muted/10">
                  <Link to="/characters">
                    <Users className="mr-2 h-5 w-5" />
                    Список персонажей
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Books Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-philosopher">
            Справочники
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-lg border-primary/30 bg-card/80 backdrop-blur-sm hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl text-foreground">
                  Книга правил игрока
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Справочник по классам, расам и правилам
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Link to="/handbook">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Открыть справочник
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border-secondary/30 bg-card/80 backdrop-blur-sm hover:shadow-secondary/10 hover:border-secondary/50 transition-all duration-300">
              <CardHeader className="text-center">
                <BookMarked className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <CardTitle className="text-2xl text-foreground">
                  Книга заклинаний
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  База данных всех заклинаний D&D 5e
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                  <Link to="/spellbook">
                    <BookMarked className="mr-2 h-5 w-5" />
                    Книга заклинаний
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Все персонажи и инструменты доступны через навигацию
          </p>
          <Button asChild size="lg" variant="outline">
            <Link to="/characters">
              <Users className="mr-2 h-5 w-5" />
              Перейти к персонажам
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;