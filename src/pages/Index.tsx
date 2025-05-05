
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Users, FileText, BookOpen, DiceD20, PlusCircle, Map, Scroll } from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import ThemeSelector from '@/components/ThemeSelector';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';

const Index = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const menuItems = [
    {
      title: 'Персонажи',
      description: 'Управление персонажами',
      icon: <Users size={32} />,
      link: '/characters',
      color: '#3B82F6',
    },
    {
      title: 'Создать персонажа',
      description: 'Создание нового персонажа',
      icon: <PlusCircle size={32} />,
      link: '/character-creation',
      color: '#10B981',
    },
    {
      title: 'Лист персонажа',
      description: 'Просмотр и редактирование',
      icon: <FileText size={32} />,
      link: '/sheet',
      color: '#F59E0B',
    },
    {
      title: 'Книга заклинаний',
      description: 'Изучение и поиск заклинаний',
      icon: <BookOpen size={32} />,
      link: '/spellbook',
      color: '#8B5CF6',
    },
    {
      title: 'Игра',
      description: 'Присоединиться к сессии',
      icon: <DiceD20 size={32} />,
      link: '/join',
      color: '#EF4444',
    },
    {
      title: 'Справочник',
      description: 'Расы, классы, предыстории',
      icon: <Scroll size={32} />,
      link: '/handbook',
      color: '#EC4899',
    },
  ];

  return (
    <BackgroundWrapper>
      <div className="container px-4 mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-4xl font-bold" 
            style={{ 
              color: currentTheme.accent,
              textShadow: `0 0 10px ${currentTheme.accent}60`
            }}
          >
            Dungeons & Dragons 5e
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
                className="p-6 rounded-lg transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg flex flex-col h-full"
                style={{ 
                  backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)',
                  borderLeft: `4px solid ${item.color}`,
                  boxShadow: `0 4px 12px ${currentTheme.accent}30`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-full" 
                    style={{ 
                      color: item.color,
                      backgroundColor: `${item.color}20`
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
                <h3 
                  className="text-xl font-semibold mb-2" 
                  style={{ color: currentTheme.textColor }}
                >
                  {item.title}
                </h3>
                <p 
                  className="text-sm" 
                  style={{ color: `${currentTheme.textColor}90` }}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default Index;
