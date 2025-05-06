import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import { Book, BookOpen, Scroll, User, UserPlus, Shield, Users } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import ProfilePreview from '@/components/home/ProfilePreview';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const Home = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const isDM = currentUser?.isDM;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-7xl">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 
                className="font-philosopher text-4xl md:text-5xl font-bold" 
                style={{ 
                  color: currentTheme.textColor,
                  textShadow: `0 0 10px ${currentTheme.accent}80`
                }}
              >
                Dungeons & Dragons 5e
              </h1>
              <p className="text-lg text-gray-300 mt-2">
                Погрузитесь в мир приключений и фэнтези
              </p>
            </div>
            <IconOnlyNavigation includeThemeSelector />
          </header>

          <main>
            {/* Профиль пользователя (если авторизован) */}
            {isAuthenticated && <ProfilePreview />}

            {/* Основные карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Персонажи */}
              <Card 
                className="backdrop-blur-sm border-blue-500/30 shadow-lg overflow-hidden group hover:shadow-blue-500/20 transition-all duration-300"
                style={{ backgroundColor: `${currentTheme.background}90`, borderColor: `${currentTheme.accent}40` }}
              >
                <CardHeader className="pb-4">
                  <div 
                    className="rounded-full w-12 h-12 flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${currentTheme.accent}20` }}
                  >
                    <Users className="h-6 w-6" style={{ color: currentTheme.accent }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: currentTheme.textColor }}>Персонажи</CardTitle>
                  <CardDescription style={{ color: `${currentTheme.textColor}80` }}>
                    Управление персонажами
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm" style={{ color: `${currentTheme.textColor}90` }}>
                  <p>Просматривайте список ваших персонажей, редактируйте их характеристики и историю.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full btn-magic"
                    onClick={() => handleNavigation('/characters')}
                    style={{ 
                      backgroundColor: currentTheme.accent,
                      color: '#000',
                      borderColor: currentTheme.accent
                    }}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Создать персонажа */}
              <Card className="bg-emerald-900/40 backdrop-blur-sm border-emerald-500/30 shadow-lg overflow-hidden group hover:shadow-emerald-500/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="rounded-full bg-emerald-500/20 w-12 h-12 flex items-center justify-center mb-2">
                    <UserPlus className="h-6 w-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Создать персонажа</CardTitle>
                  <CardDescription className="text-gray-300">
                    Создание нового персонажа
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <p>Создайте нового персонажа, выберите расу, класс, предысторию и распределите характеристики.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-magic"
                    onClick={() => handleNavigation('/character-creation')}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Лист персонажа */}
              <Card className="bg-amber-900/40 backdrop-blur-sm border-amber-500/30 shadow-lg overflow-hidden group hover:shadow-amber-500/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="rounded-full bg-amber-500/20 w-12 h-12 flex items-center justify-center mb-2">
                    <Book className="h-6 w-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Лист персонажа</CardTitle>
                  <CardDescription className="text-gray-300">
                    Просмотр и редактирование
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <p>Просматривайте и редактируйте листы персонажей, отслеживайте инвентарь и заклинания.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white btn-magic"
                    onClick={() => handleNavigation('/characters')}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Книга заклинаний */}
              <Card className="bg-violet-900/40 backdrop-blur-sm border-violet-500/30 shadow-lg overflow-hidden group hover:shadow-violet-500/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="rounded-full bg-violet-500/20 w-12 h-12 flex items-center justify-center mb-2">
                    <Scroll className="h-6 w-6 text-violet-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Книга заклинаний</CardTitle>
                  <CardDescription className="text-gray-300">
                    Изучение и поиск заклинаний
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <p>Просматривайте список всех заклинаний, фильтруйте их по уровню, классу и школе магии.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white btn-magic"
                    onClick={() => handleNavigation('/spellbook')}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Игра */}
              <Card className="bg-red-900/40 backdrop-blur-sm border-red-500/30 shadow-lg overflow-hidden group hover:shadow-red-500/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="rounded-full bg-red-500/20 w-12 h-12 flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Игра</CardTitle>
                  <CardDescription className="text-gray-300">
                    Присоединиться к сессии
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <p>Присоединяйтесь к игровым сессиям, используя код приглашения от Мастера Подземелий.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white btn-magic"
                    onClick={() => handleNavigation('/join-game')}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Справочник */}
              <Card className="bg-pink-900/40 backdrop-blur-sm border-pink-500/30 shadow-lg overflow-hidden group hover:shadow-pink-500/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="rounded-full bg-pink-500/20 w-12 h-12 flex items-center justify-center mb-2">
                    <BookOpen className="h-6 w-6 text-pink-400" />
                  </div>
                  <CardTitle className="text-xl text-white">Справочник</CardTitle>
                  <CardDescription className="text-gray-300">
                    Расы, классы, предыстории
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <p>Изучайте информацию о расах, классах и предысториях персонажей мира D&D.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white btn-magic"
                    onClick={() => handleNavigation('/handbook')}
                  >
                    ПЕРЕЙТИ
                  </Button>
                </CardFooter>
              </Card>

              {/* Панель мастера (только для DM) */}
              {isDM && (
                <Card className="bg-indigo-900/40 backdrop-blur-sm border-indigo-500/30 shadow-lg overflow-hidden group hover:shadow-indigo-500/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="rounded-full bg-indigo-500/20 w-12 h-12 flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-indigo-400" />
                    </div>
                    <CardTitle className="text-xl text-white">Панель Мастера</CardTitle>
                    <CardDescription className="text-gray-300">
                      Управление сессиями
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-300">
                    <p>Создавайте и управляйте игровыми сессиями как Мастер Подземелий.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white btn-magic"
                      onClick={() => handleNavigation('/dm')}
                    >
                      ПЕРЕЙТИ
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Секция для неавторизованных пользователей */}
            {!isAuthenticated && (
              <div className="mt-12 p-6 bg-black/60 backdrop-blur-sm rounded-lg border border-purple-500/30 shadow-lg">
                <h2 className="font-philosopher text-2xl text-center mb-4">Начните свое приключение</h2>
                <p className="text-center text-gray-300 mb-6">
                  Войдите или зарегистрируйтесь, чтобы создавать и сохранять персонажей, присоединяться к игровым сессиям и многое другое.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white btn-magic"
                    onClick={() => handleNavigation('/auth')}
                  >
                    <User className="h-4 w-4 mr-2" /> Войти
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-500/50 hover:bg-purple-500/20 btn-magic"
                    onClick={() => handleNavigation('/auth')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Регистрация
                  </Button>
                </div>
              </div>
            )}

            {/* Добавьте в раздел с навигацией или там, где отображаются основные кнопки: */}
            <Button variant="outline" asChild className="w-full mb-2">
              <Link to="/test">Тест загрузки персонажей</Link>
            </Button>
          </main>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Home;
