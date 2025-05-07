
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Book, 
  User, 
  Shield, 
  Home, 
  Users, 
  UserPlus, 
  FileText,
  Dices
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const NavigationButtons = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  // Массив с данными кнопок навигации
  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Главная",
      href: "/",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Персонажи",
      href: "/characters",
    },
    {
      icon: <Book className="h-5 w-5" />,
      label: "Справочник",
      href: "/handbook",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Заклинания",
      href: "/dnd-spells",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Вести игру",
      href: "/dm-session",
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: "Присоединиться",
      href: "/join-game",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Мастер",
      href: "/dm",
    },
    {
      icon: <Dices className="h-5 w-5" />,
      label: "Отладка",
      href: "/debug",
    }
  ];

  return (
    <>
      {menuItems.map((item, index) => (
        <Tooltip key={index} delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon"
              variant={location.pathname === item.href ? "default" : "ghost"}
              className="rounded-full"
              style={{
                ...(location.pathname === item.href && {
                  backgroundColor: `${currentTheme.accent}30`,
                  color: currentTheme.accent,
                })
              }}
            >
              <Link to={item.href}>
                {item.icon}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  );
};

export default NavigationButtons;
