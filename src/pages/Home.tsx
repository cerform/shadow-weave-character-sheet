import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Scroll, Dice6, Shield, UserPlus } from 'lucide-react';
import ProfilePreview from '@/components/home/ProfilePreview';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character';
import { subscribeToCharacters } from '@/services/characterService';
import CharacterCard from '@/components/home/CharacterCard';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [characters, setCharacters] = useState<Character[]>([]);

  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    const unsubscribe = subscribeToCharacters(setCharacters);
    return () => unsubscribe?.();
  }, []);

  const navigateToAuth = () => {
    console.log("Home: Переход на страницу /auth");
    navigate('/auth');
  };

  const quickActions = [
    {
      icon: Users,
      title: "Управление персонажами",
      description: "Создавайте и управляйте своими персонажами D&D",
      href: "/character-management",
      color: currentTheme.accent
    },
    {
      icon: BookOpen,
      title: "Книга заклинаний",
      description: "Изучайте и организуйте заклинания D&D 5e",
      href: "/spellbook",
      color: "#8B5CF6"
    },
    {
      icon: Scroll,
      title: "Справочник D&D",
      description: "Полный справочник по заклинаниям D&D",
      href: "/dnd-spells",
      color: "#F59E0B"
    },
    {
      icon: Shield,
      title: "Экран мастера",
      description: "Инструменты для мастера подземелий",
      href: "/dm",
      color: "#EF4444",
      requiresAuth: true
    }
  ];

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.background}CC 100%)`,
        color: currentTheme.textColor
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: currentTheme.accent }}
          >
            Shadow Weave
          </h1>
          <p
            className="text-xl md:text-2xl mb-8"
            style={{ color: `${currentTheme.textColor}80` }}
          >
            Управление персонажами D&D 5e
          </p>

          {!isAuthenticated && (
            <Button
              onClick={navigateToAuth}
              size="lg"
              className="gap-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText || '#FFFFFF'
              }}
            >
              <UserPlus className="h-5 w-5" />
              Начать приключение
            </Button>
          )}
        </div>

        {/* 🧙 Персонажи пользователя */}
        {isAuthenticated && characters.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.textColor }}>
              Ваши персонажи
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfilePreview />

          <div className="lg:col-span-2">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: currentTheme.textColor }}
            >
              Быстрые действия
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isDisabled = action.requiresAuth && !isAuthenticated;

                return (
                  <Card
                    key={index}
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer bg-black/50 backdrop-blur-sm border ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                    style={{ borderColor: `${action.color}50` }}
                    onClick={() => {
                      if (isDisabled) {
                        navigateToAuth();
                      } else {
                        navigate(action.href);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon
                          className="h-8 w-8"
                          style={{ color: action.color }}
                        />
                        <CardTitle
                          className="text-lg"
                          style={{ color: currentTheme.textColor }}
                        >
                          {action.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription style={{ color: `${currentTheme.textColor}70` }}>
                        {action.description}
                        {isDisabled && (
                          <span className="block mt-2 text-sm" style={{ color: action.color }}>
                            Требуется авторизация
                          </span>
                        )}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{ color: currentTheme.textColor }}
          >
            Возможности приложения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Dice6
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: currentTheme.accent }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: currentTheme.textColor }}
              >
                3D Кости
              </h3>
              <p style={{ color: `${currentTheme.textColor}70` }}>
                Реалистичные 3D кости для бросков
              </p>
            </div>
            <div className="text-center">
              <BookOpen
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: currentTheme.accent }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: currentTheme.textColor }}
              >
                Полная база заклинаний
              </h3>
              <p style={{ color: `${currentTheme.textColor}70` }}>
                Все заклинания D&D 5e с детальными описаниями
              </p>
            </div>
            <div className="text-center">
              <Users
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: currentTheme.accent }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: currentTheme.textColor }}
              >
                Многопользовательский режим
              </h3>
              <p style={{ color: `${currentTheme.textColor}70` }}>
                Игра в команде с друзьями онлайн
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
