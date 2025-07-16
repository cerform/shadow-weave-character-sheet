import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Scroll, Dice6, Shield, UserPlus, Sparkles, Swords, Map, Settings } from 'lucide-react';
import ProfilePreview from '@/components/home/ProfilePreview';
import CharactersList from '@/components/home/CharactersList';
import { useAuth } from '@/hooks/use-auth';
import FantasyThemeSelector from '@/components/FantasyThemeSelector';
import { logCharacterSystemDiagnostics } from '@/utils/characterDiagnostics';
import fantasyBg1 from '@/assets/fantasy-bg-1.jpg';
import fantasyBg2 from '@/assets/fantasy-bg-2.jpg';
import fantasyBg3 from '@/assets/fantasy-bg-3.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Выполняем диагностику при загрузке главной страницы
  useEffect(() => {
    logCharacterSystemDiagnostics();
  }, []);

  const navigateToAuth = () => {
    console.log("Home: Переход на страницу /auth");
    navigate('/auth');
  };

  const quickActions = [
    {
      icon: UserPlus,
      title: "Создать персонажа",
      description: "Создайте нового персонажа для D&D 5e с пошаговым мастером создания",
      href: "/character-creation",
      featured: true,
      gradient: "from-primary/20 to-accent/20"
    },
    {
      icon: Users,
      title: "Управление персонажами",
      description: "Просматривайте, редактируйте и управляйте всеми своими персонажами",
      href: "/character-management",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: BookOpen,
      title: "Книга заклинаний",
      description: "Полная база заклинаний D&D 5e с поиском и фильтрами",
      href: "/spellbook",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Scroll,
      title: "Справочник D&D",
      description: "Подробные описания заклинаний, правил и механик игры",
      href: "/dnd-spells",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: Shield,
      title: "Экран мастера",
      description: "Инструменты для ведения игровых сессий и управления партией",
      href: "/dm",
      requiresAuth: true,
      gradient: "from-red-500/20 to-rose-500/20"
    },
    {
      icon: Map,
      title: "Боевая карта",
      description: "Интерактивная карта для проведения тактических боёв",
      href: "/battle",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ];

  const features = [
    {
      icon: Dice6,
      title: "3D Кости",
      description: "Реалистичные 3D кости для бросков с физикой и звуковыми эффектами",
      color: "text-amber-400"
    },
    {
      icon: BookOpen,
      title: "Полная база заклинаний",
      description: "Все заклинания D&D 5e с детальными описаниями и компонентами",
      color: "text-purple-400"
    },
    {
      icon: Users,
      title: "Многопользовательский режим",
      description: "Совместная игра в реальном времени с друзьями онлайн",
      color: "text-blue-400"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Фоновые изображения */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${fantasyBg1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Магические частицы */}
      <div className="absolute inset-0 z-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-mystical-flow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Theme Selector */}
      <div className="absolute top-6 right-6 z-20">
        <FantasyThemeSelector />
      </div>

      {/* Контент */}
      <div className="relative z-10 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16 pt-8">
            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-fantasy-title mb-6 text-glow bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent animate-breathe">
                Shadow Weave
              </h1>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground font-fantasy-header">
              ⚔️ Мастерская для создания героев D&D 5e ⚔️
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-32" />
              <Swords className="h-6 w-6 text-primary" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-32" />
            </div>
            
            {!isAuthenticated && (
              <Button 
                onClick={navigateToAuth}
                size="lg"
                className="btn-glow gap-3 text-lg px-8 py-4 h-auto font-fantasy-header"
              >
                <UserPlus className="h-6 w-6" />
                Начать приключение
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-16">
            {/* Profile Preview */}
            <Card className="xl:col-span-1 magic-card border-primary/20 bg-card/50 backdrop-blur-sm">
              <ProfilePreview />
            </Card>
            
            {/* Characters List */}
            <Card className="xl:col-span-3 magic-card border-primary/20 bg-card/50 backdrop-blur-sm">
              <CharactersList />
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-fantasy-header mb-4 text-glow">
                🎲 Быстрые действия
              </h2>
              <p className="text-muted-foreground font-fantasy-body">
                Выберите действие для начала работы с приложением
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isDisabled = action.requiresAuth && !isAuthenticated;
                const isFeatured = action.featured;
                
                return (
                  <Card
                    key={index}
                    className={`
                      magic-card cursor-pointer group h-full transition-all duration-300
                      border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card/70
                      ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2'}
                      ${isFeatured ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/20' : ''}
                    `}
                    onClick={() => {
                      if (isDisabled) {
                        navigateToAuth();
                      } else {
                        navigate(action.href);
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className={`
                          p-4 rounded-xl bg-gradient-to-br ${action.gradient}
                          border border-primary/30 group-hover:border-primary/50
                          transition-all duration-300 group-hover:scale-110
                        `}>
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className={`
                            text-lg font-fantasy-header
                            ${isFeatured ? 'text-primary' : 'text-foreground'}
                          `}>
                            {action.title}
                            {isFeatured && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                ✨ Популярное
                              </span>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="font-fantasy-body text-sm leading-relaxed">
                        {action.description}
                        {isDisabled && (
                          <span className="block mt-3 text-destructive font-medium text-xs">
                            ⚠️ Требуется авторизация
                          </span>
                        )}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Features Preview */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-fantasy-header mb-4 text-glow">
                ⚡ Возможности приложения
              </h2>
              <p className="text-muted-foreground font-fantasy-body max-w-2xl mx-auto">
                Погрузитесь в мир D&D с современными инструментами и красивым интерфейсом
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="magic-card text-center group border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className={`h-10 w-10 ${feature.color}`} />
                    </div>
                    
                    <CardTitle className="text-xl font-fantasy-header text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="font-fantasy-body leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <div className="inline-flex items-center gap-4 text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span className="font-fantasy-body text-sm">
                Создано с магией для любителей D&D
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;