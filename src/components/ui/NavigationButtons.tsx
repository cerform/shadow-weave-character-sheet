
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Home, User, Users, Gamepad2, LogOut, Crown } from 'lucide-react';

const NavigationButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/characters', icon: Users, label: 'Персонажи' },
    { path: '/dm', icon: Crown, label: 'Мастер' },
    { path: '/session', icon: Gamepad2, label: 'Сессия' },
  ];

  if (location.pathname === '/') return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Button>
        );
      })}
      
      {currentUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          <span className="hidden md:inline">Профиль</span>
        </Button>
      )}
      
      {currentUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Выход</span>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
