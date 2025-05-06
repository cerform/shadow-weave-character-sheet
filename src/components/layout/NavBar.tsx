
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ThemeToggle from './ThemeToggle';

interface NavBarProps {
  showAuth?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showAuth = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav 
      className="w-full py-4 px-6 flex justify-between items-center" 
      style={{ backgroundColor: currentTheme.background, borderBottom: `1px solid ${currentTheme.accent}30` }}
    >
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
          D&D Character
        </Link>
        <div className="ml-8 flex items-center space-x-4">
          <Link to="/characters" className="hover:underline" style={{ color: currentTheme.textColor }}>
            Персонажи
          </Link>
          <Link to="/create" className="hover:underline" style={{ color: currentTheme.textColor }}>
            Создать
          </Link>
          <Link to="/dm" className="hover:underline" style={{ color: currentTheme.textColor }}>
            Мастер
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Добавляем переключатель тем */}
        <ThemeToggle />
        
        {showAuth && (
          <>
            {user ? (
              <div className="flex items-center space-x-4">
                <span style={{ color: currentTheme.textColor }}>
                  {user.email || 'Пользователь'}
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                >
                  Войти
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  style={{ backgroundColor: currentTheme.accent, color: currentTheme.background }}
                >
                  Регистрация
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
