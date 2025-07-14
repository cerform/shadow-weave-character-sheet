
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Users, UserPlus, Swords, Shield } from "lucide-react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-philosopher">
              D&D Character Manager
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Создавайте персонажей, управляйте сессиями и погружайтесь в мир приключений
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Session Management */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center font-philosopher">
            Управление сессиями
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-lg border border-purple-700/30 bg-black/30 backdrop-blur-sm hover:shadow-purple-700/10 hover:border-purple-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <CardTitle className="text-2xl text-white">
                  Стать Мастером
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Создайте новую сессию и управляйте игрой
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">
                  Создавайте сессии, приглашайте игроков и управляйте игровым процессом
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/dm">
                    <Shield className="mr-2 h-5 w-5" />
                    Панель Мастера
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border border-blue-700/30 bg-black/30 backdrop-blur-sm hover:shadow-blue-700/10 hover:border-blue-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <CardTitle className="text-2xl text-white">
                  Присоединиться к игре
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Войдите в существующую сессию как игрок
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">
                  Введите код сессии и присоединяйтесь к приключению с друзьями
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center font-philosopher">
            Управление персонажами
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="shadow-lg border border-emerald-700/30 bg-black/30 backdrop-blur-sm hover:shadow-emerald-700/10 hover:border-emerald-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Swords className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
                <CardTitle className="text-2xl text-white">
                  Создать персонажа
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Создайте нового героя для ваших приключений
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/character-creation">
                    <Swords className="mr-2 h-5 w-5" />
                    Создать
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border border-amber-700/30 bg-black/30 backdrop-blur-sm hover:shadow-amber-700/10 hover:border-amber-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                <CardTitle className="text-2xl text-white">
                  Мои персонажи
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Просмотрите всех созданных персонажей
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-600/10">
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center font-philosopher">
            Справочники
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-lg border border-indigo-700/30 bg-black/30 backdrop-blur-sm hover:shadow-indigo-700/10 hover:border-indigo-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
                <CardTitle className="text-2xl text-white">
                  Книга правил игрока
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Справочник по классам, расам и правилам
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/10">
                  <Link to="/handbook">
                    <Users className="mr-2 h-5 w-5" />
                    Открыть справочник
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg border border-pink-700/30 bg-black/30 backdrop-blur-sm hover:shadow-pink-700/10 hover:border-pink-700/50 transition-all duration-300">
              <CardHeader className="text-center">
                <Swords className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                <CardTitle className="text-2xl text-white">
                  Книга заклинаний
                </CardTitle>
                <CardDescription className="text-gray-300">
                  База данных всех заклинаний D&D 5e
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild size="lg" variant="outline" className="border-pink-600 text-pink-400 hover:bg-pink-600/10">
                  <Link to="/spellbook">
                    <Swords className="mr-2 h-5 w-5" />
                    Книга заклинаний
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Characters List - moved to dedicated page */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Ваши персонажи доступны на отдельной странице
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
