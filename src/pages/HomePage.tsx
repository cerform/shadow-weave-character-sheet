import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Scroll, Dice6, Shield, UserPlus, Sparkles, Swords, Map, Settings, Crown } from 'lucide-react';
import ProfilePreview from '@/components/home/ProfilePreview';
import CharactersList from '@/components/home/CharactersList';
import { useAuth } from '@/hooks/use-auth';
import FantasyThemeSelector from '@/components/FantasyThemeSelector';
import fantasyBg1 from '@/assets/fantasy-bg-1.jpg';
import fantasyBg2 from '@/assets/fantasy-bg-2.jpg';
import fantasyBg3 from '@/assets/fantasy-bg-3.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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
      href: "/characters",
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
      description: "Подробные описания рас, классов и правил игры",
      href: "/handbook",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: Crown,
      title: "Панель Мастера",
      description: "Современная панель DM с инициативой, токенами, туманом войны и VTT интерфейсом",
      href: "/dm-dashboard-new",
      gradient: "from-red-500/20 to-rose-500/20"
    },
    {
      icon: Map,
      title: "Боевая карта",
      description: "Интерактивная карта для проведения тактических боёв",
      href: "/battle-map-fixed",
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

      <div className="relative z-10">
        {/* Верхняя панель навигации */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  D&D Helper
                </h1>
                <p className="text-sm text-muted-foreground">Ваш цифровой помощник для D&D 5e</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <FantasyThemeSelector />
              {isAuthenticated ? (
                <ProfilePreview />
              ) : (
                <Button 
                  onClick={navigateToAuth}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Войти
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Главный контент */}
        <div className="container mx-auto px-4 pb-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Добро пожаловать в мир D&D
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Создавайте персонажей, изучайте заклинания, проводите эпические сессии
            </p>
          </div>

          {/* Быстрые действия */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 cursor-pointer group ${
                  action.featured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                onClick={() => navigate(action.href)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <action.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Персонажи пользователя */}
          {isAuthenticated && (
            <div className="mb-16">
              <CharactersList />
            </div>
          )}

          {/* Особенности */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-8">Возможности приложения</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="text-center group hover:scale-105 transition-transform duration-300"
                >
                  <div className="mb-4 inline-flex p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Призыв к действию */}
          {!isAuthenticated && (
            <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Готовы начать приключение?</h3>
              <p className="text-muted-foreground mb-6">
                Присоединитесь к тысячам игроков, которые уже используют D&D Helper
              </p>
              <Button 
                size="lg"
                onClick={navigateToAuth}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Создать аккаунт
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;