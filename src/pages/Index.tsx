
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import { 
  Wand2, BookMarked, BookOpen, Dices, PlusCircle, 
  Map, Scroll, Sparkles, Sword 
} from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import ThemeSelector from '@/components/ThemeSelector';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import CharactersList from '@/components/home/CharactersList';

const Index = () => {
  const { user } = useAuth();
  const { activeTheme, currentTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const theme = currentTheme || themes[themeKey] || themes.default;
  const [loadFadeIn, setLoadFadeIn] = useState(false);

  useEffect(() => {
    // Задержка для эффекта последовательного появления
    setLoadFadeIn(true);
    console.log('Index: страница загружена, тема:', activeTheme);
  }, []);

  const menuItems = [
    {
      title: 'Персонажи',
      description: 'Управление персонажами',
      icon: <Wand2 size={32} />,
      link: '/characters',
      color: '#3B82F6',
      delay: 0,
    },
    {
      title: 'Создать персонажа',
      description: 'Создание нового персонажа',
      icon: <PlusCircle size={32} />,
      link: '/character-creation',
      color: '#10B981',
      delay: 0.1,
    },
    {
      title: 'Лист персонажа',
      description: 'Просмотр и редактирование',
      icon: <Scroll size={32} />,
      link: '/character-sheet/sample',
      color: '#F59E0B',
      delay: 0.2,
    },
    {
      title: 'Книга заклинаний',
      description: 'Изучение и поиск заклинаний',
      icon: <BookOpen size={32} />,
      link: '/spellbook',
      color: '#8B5CF6',
      delay: 0.3,
    },
    {
      title: 'Игра',
      description: 'Присоединиться к сессии',
      icon: <Dices size={32} />,
      link: '/join',
      color: '#EF4444',
      delay: 0.4,
    },
    {
      title: 'Справочник',
      description: 'Расы, классы, предыстории',
      icon: <BookMarked size={32} />,
      link: '/handbook',
      color: '#EC4899',
      delay: 0.5,
    },
  ];

  return (
    <BackgroundWrapper>
      <div className="container px-4 mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-5xl font-bold font-philosopher relative group"
            style={{ 
              color: theme.accent,
              textShadow: `0 0 10px ${theme.accent}60`
            }}
          >
            <span>Dungeons & Dragons 5e</span>
            <Sparkles 
              className="absolute -top-4 -right-8 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              style={{ color: theme.accent }}
            />
            {/* Декоративный элемент под заголовком */}
            <div
              className="h-1 w-3/4 mt-2 rounded"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                boxShadow: `0 0 8px ${theme.accent}70`
              }}
            />
          </h1>
          <div className="flex items-center gap-2">
            <ThemeSelector />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {menuItems.map((item, index) => (
            <Link 
              to={item.link} 
              key={index}
              className="no-underline"
            >
              <div 
                className={`p-6 rounded-lg transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg flex flex-col h-full ${loadFadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ 
                  backgroundColor: theme.cardBackground || 'rgba(0, 0, 0, 0.75)',
                  borderLeft: `4px solid ${item.color}`,
                  boxShadow: `0 4px 12px ${theme.accent}30`,
                  transitionDelay: `${item.delay}s`,
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110" 
                    style={{ 
                      color: item.color,
                      backgroundColor: `${item.color}20`,
                      boxShadow: `0 0 10px ${item.color}30`
                    }}
                  >
                    {item.icon}
                  </div>
                  <div 
                    className="w-8 h-8 opacity-30"
                    style={{
                      backgroundImage: `url('/card-decor-${index % 4 + 1}.svg')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2 font-philosopher" 
                  style={{ color: theme.textColor }}
                >
                  {item.title}
                </h3>
                <p 
                  className="text-sm" 
                  style={{ color: `${theme.textColor}90` }}
                >
                  {item.description}
                </p>
                <div className="mt-auto pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full btn-magic"
                    style={{ 
                      borderColor: item.color,
                      color: theme.textColor,
                    }}
                  >
                    Перейти
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Отображаем список персонажей */}
        <CharactersList />

        {/* Декоративный элемент-меч внизу страницы с ссылкой на страницу авторизации */}
        <div className="mt-12 mb-6 flex justify-center">
          <Link to="/auth">
            <Sword 
              size={32} 
              className="opacity-80 hover:opacity-100 animate-pulse-accent transition-all duration-300 hover:scale-110 cursor-pointer"
              style={{ 
                color: theme.accent,
                filter: `drop-shadow(0 0 6px ${theme.accent})` 
              }}
            />
          </Link>
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default Index;
