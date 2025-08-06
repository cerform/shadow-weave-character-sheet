import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dices, 
  BookOpen, 
  Settings, 
  Palette,
  Sparkles,
  Database,
  Menu,
  X,
  Home,
  Users,
  Crown,
  Gamepad2,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
import FloatingSpellWidget from '@/components/spellbook/FloatingSpellWidget';
import FantasyThemeSelector from '@/components/FantasyThemeSelector';
import { useAuth, useProtectedRoute } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

const UnifiedFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const { isAdmin, isDM } = useProtectedRoute();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [isSpellWidgetOpen, setIsSpellWidgetOpen] = useState(false);
  const [isStorageCleanerOpen, setIsStorageCleanerOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Сохраняем позицию в localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('unifiedWidgetPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved widget position', e);
      }
    }
  }, []);

  // Обновляем localStorage при изменении позиции
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('unifiedWidgetPosition', JSON.stringify(position));
    }
  }, [position, isDragging]);

  // Проверка и коррекция позиции
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth;
        const buttonHeight = buttonRef.current.offsetHeight;
        
        const maxX = window.innerWidth - buttonWidth;
        const maxY = window.innerHeight - buttonHeight;
        
        if (position.x < 0 || position.x > maxX || position.y < 0 || position.y > maxY) {
          setPosition({
            x: Math.max(0, Math.min(position.x, maxX)),
            y: Math.max(0, Math.min(position.y, maxY))
          });
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (buttonRef.current) {
      const touch = e.touches[0];
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы"
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive"
      });
    }
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

  const tools = [
    {
      icon: Dices,
      label: "Броски кубиков",
      description: "3D кости для бросков",
      color: "from-amber-500 to-orange-500",
      action: () => {
        setIsDiceModalOpen(true);
        setIsOpen(false);
      }
    },
    {
      icon: BookOpen,
      label: "Книга заклинаний",
      description: "Поиск и просмотр заклинаний",
      color: "from-purple-500 to-blue-500",
      action: () => {
        setIsSpellWidgetOpen(true);
        setIsOpen(false);
      }
    },
    {
      icon: Palette,
      label: "Смена темы",
      description: "Настройка внешнего вида",
      color: "from-pink-500 to-rose-500",
      action: () => {
        // Тема уже в меню через FantasyThemeSelector
      }
    },
    {
      icon: Database,
      label: "Очистка данных",
      description: "Управление хранилищем",
      color: "from-red-500 to-pink-500",
      action: () => {
        setIsStorageCleanerOpen(true);
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Основная плавающая кнопка */}
      <div
        ref={buttonRef}
        className={`fixed z-50 transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className={`
                h-14 w-14 rounded-full shadow-2xl
                bg-gradient-to-br from-primary via-accent to-primary
                hover:from-primary/80 hover:via-accent/80 hover:to-primary/80
                border-2 border-primary/30 hover:border-primary/50
                transition-all duration-300 hover:scale-110
                ${isOpen ? 'scale-110 shadow-primary/50' : ''}
              `}
              onClick={(e) => {
                if (!isDragging) {
                  e.stopPropagation();
                }
              }}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-80 p-0 border-primary/30 bg-card/95 backdrop-blur-lg"
            align="start"
            side="right"
          >
            <Card className="border-none shadow-2xl">
              <CardContent className="p-0">
                {/* Профиль пользователя */}
                {isAuthenticated && currentUser && (
                  <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.username || currentUser.email}`} />
                        <AvatarFallback className="bg-primary/20">
                          {(currentUser.username || currentUser.email || "").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {currentUser.username || currentUser.displayName || currentUser.email || "Искатель приключений"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin ? "👑 Администратор" : isDM ? "🎩 Мастер" : "🎲 Игрок"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Кнопки профиля */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleNavigate('/profile')}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Профиль
                      </Button>
                      
                      {isDM && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleNavigate('/dm')}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Панель DM
                        </Button>
                      )}
                      
                      {isAdmin && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleNavigate('/admin')}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Админ
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Выйти
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Навигация */}
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Menu className="h-4 w-4 text-primary" />
                    Навигация
                  </h3>
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.path}
                          variant="ghost"
                          className="w-full justify-start h-8 text-sm"
                          onClick={() => handleNavigate(item.path)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Переключатель темы */}
                <div className="p-4 border-b border-border/50">
                  <FantasyThemeSelector />
                </div>
                
                {/* Инструменты */}
                <div className="p-2">
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 mb-2 transition-all duration-300 hover:bg-primary/10"
                        onClick={tool.action}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`
                            p-2 rounded-lg bg-gradient-to-br ${tool.color} 
                            shadow-lg transition-transform hover:scale-110
                          `}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="font-fantasy-header font-medium text-sm text-foreground">
                              {tool.label}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                
                {/* Подвал */}
                <div className="p-3 border-t border-border/50 bg-muted/20">
                  <p className="text-xs text-muted-foreground text-center">
                    🎲 Перетащите виджет для перемещения
                  </p>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Модальные окна */}
      <DiceRollModal 
        open={isDiceModalOpen} 
        onClose={() => setIsDiceModalOpen(false)} 
      />
      
      {/* Используем существующие компоненты через состояние */}
      {isSpellWidgetOpen && (
        <div onClick={() => setIsSpellWidgetOpen(false)}>
          <FloatingSpellWidget />
        </div>
      )}
      
      {isStorageCleanerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Очистка данных</h3>
              <p className="text-sm text-muted-foreground mb-4">Функция очистки временно недоступна</p>
              <Button 
                onClick={() => setIsStorageCleanerOpen(false)}
                className="w-full"
                variant="outline"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UnifiedFloatingWidget;