import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, 
  Home, 
  User, 
  Users, 
  Gamepad2, 
  LogOut, 
  Crown
} from 'lucide-react';

interface CompactNavigationMenuProps {
  className?: string;
}

const CompactNavigationMenu: React.FC<CompactNavigationMenuProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/characters', icon: Users, label: 'Персонажи' },
    { path: '/dm', icon: Crown, label: 'Мастер' },
    { path: '/session', icon: Gamepad2, label: 'Сессия' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (location.pathname === '/') return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-background/80 backdrop-blur-md border-border/50 hover:bg-background/90"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Меню</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-background/95 backdrop-blur-md border-border/50"
          sideOffset={5}
        >
          <DropdownMenuLabel>Навигация</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <DropdownMenuItem
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-2 cursor-pointer ${
                  isActive ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          {currentUser && (
            <DropdownMenuItem
              onClick={() => handleNavigate('/profile')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              Профиль
            </DropdownMenuItem>
          )}
          
          {currentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Выход
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CompactNavigationMenu;