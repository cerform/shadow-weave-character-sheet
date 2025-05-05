
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import ThemeSelector from '@/components/ThemeSelector';
import { BookText, LogOut, User, Home } from 'lucide-react';
import { useUserTheme } from '@/hooks/use-user-theme';

const MainNavigation = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { currentThemeStyles } = useUserTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <Link to="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <Home className="h-5 w-5" />
            <span className="hidden md:inline">Главная</span>
          </Button>
        </Link>
        
        {isAuthenticated && (
          <>
            <Link to="/handbook">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 ml-2 text-white hover:bg-white/10"
              >
                <BookText className="h-5 w-5" />
                <span className="hidden md:inline">Справочник</span>
              </Button>
            </Link>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeSelector />
        
        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <User className="h-5 w-5" />
                <span className="hidden md:inline">{currentUser?.displayName || 'Профиль'}</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Выход</span>
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button size="sm" className="bg-primary/80 hover:bg-primary border border-primary/20">
              Войти
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNavigation;
