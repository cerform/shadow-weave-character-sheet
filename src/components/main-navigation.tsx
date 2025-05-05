
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adaptFirebaseUser } from '@/types/user';

interface NavigationProps {
  className?: string;
}

const MainNavigation: React.FC<NavigationProps> = ({ className }) => {
  const { currentUser, logout } = useAuth();
  const adaptedUser = currentUser ? adaptFirebaseUser(currentUser) : null;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе из системы', error);
    }
  };

  return (
    <NavigationMenu className={cn("max-w-full w-full justify-between px-4", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Главная
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Персонажи</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/sheet"
                  >
                    <div className="text-sm font-medium leading-none">Лист персонажа</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Просмотр и редактирование вашего активного персонажа
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/character-creation"
                  >
                    <div className="text-sm font-medium leading-none">Создание персонажа</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Создание нового персонажа с нуля
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/characters"
                  >
                    <div className="text-sm font-medium leading-none">Список персонажей</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Просмотр всех созданных персонажей
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Справочники</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/spellbook"
                  >
                    <div className="text-sm font-medium leading-none">Книга заклинаний</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Просмотр и поиск заклинаний
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/handbook"
                  >
                    <div className="text-sm font-medium leading-none">Справочник</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Основные правила и руководство игрока
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Игра</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/join"
                  >
                    <div className="text-sm font-medium leading-none">Присоединиться к сессии</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Присоединиться к существующей игровой сессии
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    to="/dm-dashboard"
                  >
                    <div className="text-sm font-medium leading-none">Панель Мастера</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Управление сессиями и кампаниями
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      
      {/* Правая часть навигации - профиль пользователя */}
      <NavigationMenuList>
        {currentUser ? (
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${adaptedUser?.username || 'guest'}`} />
                  <AvatarFallback>{currentUser.displayName?.substring(0, 2) || 'ГП'}</AvatarFallback>
                </Avatar>
                <span>{currentUser.displayName || 'Пользователь'}</span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-3 p-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="/profile" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      Профиль
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <a 
                    onClick={handleLogout}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    Выйти
                  </a>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <Link to="/auth">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Войти
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
