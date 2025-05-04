
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Book, LogIn, BookOpen, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

const GlobalNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { activeTheme } = useUserTheme();
  
  // Получаем текущую тему
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Определяем пути для навигации
  const navigationItems = [
    { name: 'Главная', path: '/', icon: Home },
    { name: 'Книга заклинаний', path: '/spellbook', icon: Book },
    { name: 'Персонажи', path: '/characters', icon: Users },
    { name: 'Руководство', path: '/handbook', icon: BookOpen },
    { name: 'Мастер', path: '/dm-dashboard', icon: Shield },
  ];

  // Добавляем кнопку авторизации/профиля
  const authButton = currentUser 
    ? { name: 'Профиль', path: '/profile', icon: Users }
    : { name: 'Войти', path: '/auth', icon: LogIn };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-primary/20 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`flex items-center gap-1 whitespace-nowrap ${isActive ? 'shadow-md' : ''}`}
                onClick={() => navigate(item.path)}
                style={{
                  backgroundColor: isActive ? currentTheme.accent : '',
                  borderColor: isActive ? 'transparent' : currentTheme.accent
                }}
              >
                <item.icon size={16} />
                <span className="hidden md:inline">{item.name}</span>
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => navigate(authButton.path)}
          style={{ borderColor: currentTheme.accent }}
        >
          <authButton.icon size={16} />
          <span className="hidden md:inline">{authButton.name}</span>
        </Button>
      </div>
    </nav>
  );
};

export default GlobalNavigation;
