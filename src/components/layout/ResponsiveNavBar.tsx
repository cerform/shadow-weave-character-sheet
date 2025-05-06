
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import ThemeToggle from './ThemeToggle';
import MobileNavigation from './MobileNavigation';

const ResponsiveNavBar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { themeStyles } = useTheme();
  
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Мобильная навигация (меню-бургер) - отображается только на маленьких экранах */}
          <div className="flex md:hidden">
            <MobileNavigation />
          </div>
          
          {/* Логотип - всегда виден */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">D&D Character</span>
          </Link>
          
          {/* Основная навигация - скрыта на мобильных */}
          <nav className="hidden md:flex items-center space-x-4 mx-6">
            <Link to="/handbook" className="text-sm font-medium transition-colors hover:text-primary">
              Справочник
            </Link>
            <Link to="/spellbook" className="text-sm font-medium transition-colors hover:text-primary">
              Заклинания
            </Link>
            <Link to="/character-creation" className="text-sm font-medium transition-colors hover:text-primary">
              Создать персонажа
            </Link>
          </nav>
          
          {/* Правая часть - всегда видна, но адаптивна */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {user ? (
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate('/profile')}
              >
                {user.email || 'Профиль'}
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate('/auth')}
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResponsiveNavBar;
