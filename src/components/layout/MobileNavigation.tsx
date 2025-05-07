
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, BookMarked, Scroll, Wand2, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from './ThemeToggle';
import { useToast } from '@/hooks/use-toast';

const MobileNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, themeStyles } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const closeMenu = () => setIsOpen(false);
  
  // Автоматически закрываем меню при изменении маршрута
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы"
      });
      navigate('/auth');
      closeMenu();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };
  
  const menuItems = [
    { to: '/', icon: <Shield className="h-5 w-5" />, label: 'Главная' },
    { to: '/handbook', icon: <BookMarked className="h-5 w-5" />, label: 'Справочник' },
    { to: '/spellbook', icon: <Scroll className="h-5 w-5" />, label: 'Заклинания' },
    { to: '/character-creation', icon: <Wand2 className="h-5 w-5" />, label: 'Создать персонажа' },
  ];
  
  const userMenuItems = user ? [
    { to: '/profile', icon: <User className="h-5 w-5" />, label: 'Профиль' },
    { onClick: handleLogout, icon: <LogOut className="h-5 w-5" />, label: 'Выйти' }
  ] : [
    { to: '/auth', icon: <User className="h-5 w-5" />, label: 'Войти' }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            aria-label="Меню"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[75vw] max-w-xs bg-background/95 backdrop-blur-sm pt-10">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">D&D Character</SheetTitle>
          </SheetHeader>
          
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item, index) => (
              <Link 
                key={index}
                to={item.to}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.to) 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
            
            <div className="my-3 border-t border-muted/50" />
            
            {userMenuItems.map((item, index) => (
              item.onClick ? (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="flex items-center px-4 py-3 rounded-lg transition-colors w-full text-left hover:bg-muted/50"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.to) 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              )
            ))}
            
            <div className="mt-auto pt-6 pb-4 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Тема</span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNavigation;
