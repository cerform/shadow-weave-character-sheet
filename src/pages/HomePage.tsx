import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Scroll, Dice6, Shield, UserPlus } from 'lucide-react';
import ProfilePreview from '@/components/home/ProfilePreview';
import CharactersList from '@/components/home/CharactersList';
import { useAuth } from '@/hooks/use-auth';
import FantasyThemeSelector from '@/components/FantasyThemeSelector';
import { logCharacterSystemDiagnostics } from '@/utils/characterDiagnostics';

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
      description: "Создайте нового персонажа для D&D 5e",
      href: "/character-creation",
      featured: true
    },
    {
      icon: Users,
      title: "Управление персонажами",
      description: "Просматривайте и управляйте существующими персонажами",
      href: "/character-management"
    },
    {
      icon: BookOpen,
      title: "Книга заклинаний",
      description: "Изучайте и организуйте заклинания D&D 5e",
      href: "/spellbook"
    },
    {
      icon: Scroll,
      title: "Справочник D&D",
      description: "Полный справочник по заклинаниям D&D",
      href: "/dnd-spells"
    },
    {
      icon: Shield,
      title: "Экран мастера",
      description: "Инструменты для мастера подземелий",
      href: "/dm",
      requiresAuth: true
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Атмосферный фон */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.02) 0%, transparent 50%)
          `
        }}
      />

      {/* Theme Selector */}
      <div className="absolute top-6 right-6 z-20">
        <FantasyThemeSelector />
      </div>

      {/* Контент */}
      <div className="relative z-10 p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-fantasy-title mb-4 text-glow">
              Shadow Weave
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground font-fantasy-body">
              ⚔️ Управление персонажами D&D 5e ⚔️
            </p>
            
            {!isAuthenticated && (
              <Button 
                onClick={navigateToAuth}
                size="lg"
                className="btn-glow gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Начать приключение
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Preview */}
            <ProfilePreview />
            
            {/* Characters List */}
            <CharactersList />
            
            {/* Quick Actions */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-fantasy-heading mb-6">
                🎲 Быстрые действия
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const isDisabled = action.requiresAuth && !isAuthenticated;
                  const isFeatured = action.featured;
                  
                  return (
                    <div
                      key={index}
                      className={`magic-card cursor-pointer group ${
                        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
                      } ${
                        isFeatured ? 'ring-2 ring-primary/30 bg-primary/5 hover:ring-primary/50' : ''
                      }`}
                      onClick={() => {
                        if (isDisabled) {
                          navigateToAuth();
                        } else {
                          navigate(action.href);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${
                          isFeatured 
                            ? 'bg-primary/20 border border-primary/40' 
                            : 'bg-primary/10 border border-primary/20'
                        }`}>
                          <Icon 
                            className={`h-6 w-6 ${
                              isFeatured ? 'text-primary' : 'text-primary'
                            }`} 
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-fantasy-heading ${
                            isFeatured ? 'text-primary' : 'text-foreground'
                          }`}>
                            {action.title}
                            {isFeatured && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                ✨ Рекомендуется
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground font-fantasy-body text-sm leading-relaxed">
                        {action.description}
                        {isDisabled && (
                          <span className="block mt-2 text-destructive font-medium">
                            ⚠️ Требуется авторизация
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16">
            <h2 className="text-3xl font-fantasy-heading text-center mb-8">
              ⚡ Возможности приложения
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Dice6,
                  title: "3D Кости",
                  description: "Реалистичные 3D кости для бросков"
                },
                {
                  icon: BookOpen,
                  title: "Полная база заклинаний",
                  description: "Все заклинания D&D 5e с детальными описаниями"
                },
                {
                  icon: Users,
                  title: "Многопользовательский режим",
                  description: "Игра в команде с друзьями онлайн"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-fantasy-heading mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-fantasy-body">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;