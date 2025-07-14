import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookMarked, BookOpen, Users, Shield, UserPlus, Swords, 
  Sparkles, Flame, Crown, Scroll, Wand2
} from 'lucide-react';
import FantasyThemeSelector from '@/components/FantasyThemeSelector';
import { RunicBorder } from '@/components/ui/MysticalRune';
import { logCharacterSystemDiagnostics } from '@/utils/characterDiagnostics';

const HomePage = () => {
  // Выполняем диагностику при загрузке главной страницы
  useEffect(() => {
    logCharacterSystemDiagnostics();
  }, []);

  const menuSections = [
    {
      title: "Управление сессиями",
      subtitle: "Создавайте приключения и присоединяйтесь к играм",
      items: [
        {
          title: 'Стать Мастером',
          description: 'Создайте новую сессию и управляйте игрой',
          icon: <Shield className="h-8 w-8" />,
          link: '/dm',
          variant: 'primary' as const,
          glow: 'primary'
        },
        {
          title: 'Присоединиться к игре',
          description: 'Войдите в существующую сессию как игрок',
          icon: <UserPlus className="h-8 w-8" />,
          link: '/session',
          variant: 'secondary' as const,
          glow: 'secondary'
        }
      ]
    },
    {
      title: "Управление персонажами",
      subtitle: "Создавайте героев и управляйте их развитием",
      items: [
        {
          title: 'Создать персонажа',
          description: 'Создайте нового героя для ваших приключений',
          icon: <Swords className="h-8 w-8" />,
          link: '/character-creation',
          variant: 'accent' as const,
          glow: 'accent'
        },
        {
          title: 'Мои персонажи',
          description: 'Просмотрите всех созданных персонажей',
          icon: <Users className="h-8 w-8" />,
          link: '/characters',
          variant: 'muted' as const,
          glow: 'muted'
        }
      ]
    },
    {
      title: "Справочники",
      subtitle: "Изучите мир D&D и магические заклинания",
      items: [
        {
          title: 'Книга правил игрока',
          description: 'Справочник по классам, расам и правилам',
          icon: <BookOpen className="h-8 w-8" />,
          link: '/handbook',
          variant: 'primary' as const,
          glow: 'primary'
        },
        {
          title: 'Книга заклинаний',
          description: 'База данных всех заклинаний D&D 5e',
          icon: <BookMarked className="h-8 w-8" />,
          link: '/spellbook',
          variant: 'secondary' as const,
          glow: 'secondary'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Магический фон с анимацией */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-accent rounded-full animate-pulse opacity-40 animation-delay-1000" />
        <div className="absolute bottom-60 left-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse opacity-50 animation-delay-2000" />
        <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-primary rounded-full animate-pulse opacity-30 animation-delay-3000" />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="relative inline-block">
                <h1 className="text-4xl md:text-7xl font-fantasy-title text-foreground mb-6 text-glow animate-glow">
                  D&D Character Manager
                </h1>
                <div className="absolute -top-4 -right-4 animate-float">
                  <Sparkles className="w-8 h-8 text-accent opacity-70" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-float animation-delay-1000">
                  <Wand2 className="w-6 h-6 text-primary opacity-50" />
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-fantasy-body">
                ✨ Создавайте персонажей, управляйте сессиями и погружайтесь в мир приключений ✨
              </p>
            </div>
            
            <div className="flex items-center gap-4 animate-float">
              <FantasyThemeSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-fantasy-heading text-foreground mb-4 text-glow">
                {section.title}
              </h2>
              <p className="text-lg text-muted-foreground font-fantasy-body max-w-2xl mx-auto">
                {section.subtitle}
              </p>
              
              {/* Декоративная линия */}
              <div className="flex items-center justify-center mt-6">
                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent w-32" />
                <Crown className="mx-4 w-5 h-5 text-accent" />
                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {section.items.map((item, itemIndex) => (
                <Link 
                  key={item.title}
                  to={item.link} 
                  className="no-underline group"
                >
                  <RunicBorder variant="simple" glowColor={
                    item.variant === 'primary' ? 'primary' :
                    item.variant === 'secondary' ? 'secondary' :
                    item.variant === 'accent' ? 'accent' : 'primary'
                  }>
                    <Card className="magic-card h-full animate-float" 
                          style={{ animationDelay: `${(sectionIndex * 2 + itemIndex) * 200}ms` }}>
                      <CardHeader className="text-center pb-4">
                        <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-br transition-all duration-300 group-hover:scale-110
                          ${item.variant === 'primary' ? 'from-primary/20 to-primary/10 text-primary' :
                            item.variant === 'secondary' ? 'from-secondary/20 to-secondary/10 text-secondary' :
                            item.variant === 'accent' ? 'from-accent/20 to-accent/10 text-accent' :
                            'from-muted/20 to-muted/10 text-muted-foreground'}`}>
                          {item.icon}
                        </div>
                        
                        <CardTitle className="text-2xl font-fantasy-heading text-foreground group-hover:text-glow transition-all">
                          {item.title}
                        </CardTitle>
                        
                        <CardDescription className="text-muted-foreground font-fantasy-body text-base">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardFooter className="flex justify-center pt-2">
                        <Button 
                          className={`btn-magic font-fantasy-body px-8 py-3 text-base group-hover:scale-105 transition-all
                            ${item.variant === 'primary' ? 'bg-primary hover:bg-primary/90' :
                              item.variant === 'secondary' ? 'bg-secondary hover:bg-secondary/90' :
                              item.variant === 'accent' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' :
                              'bg-muted hover:bg-muted/90 text-muted-foreground'}`}
                        >
                          <Scroll className="mr-2 h-4 w-4" />
                          Открыть
                        </Button>
                      </CardFooter>
                    </Card>
                  </RunicBorder>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom magical decoration */}
        <div className="text-center mt-16 mb-8">
          <div className="flex items-center justify-center gap-4 opacity-60">
            <Flame className="w-6 h-6 text-accent animate-pulse" />
            <div className="text-muted-foreground font-ancient text-lg">
              ⚔️ Приключения ждут ⚔️
            </div>
            <Flame className="w-6 h-6 text-accent animate-pulse animation-delay-1000" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;