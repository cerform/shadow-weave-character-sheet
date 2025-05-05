
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookMarked, Scroll, Map, Wand2, BookOpen, Shield, LogIn, User, LogOut, Dices } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DiceDrawer } from '@/components/dice/DiceDrawer';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser, logout } = useAuth();
  const isDM = currentUser?.isDM;
  
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  // Общие стили для всех кнопок
  const buttonStyle = {
    borderColor: currentTheme.accent,
    color: currentTheme.textColor,
    boxShadow: `0 0 5px ${currentTheme.accent}30`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              asChild
              style={buttonStyle}
              className="hover:shadow-lg transition-all hover:scale-105"
            >
              <Link to="/">
                <Shield className="size-4" />
                <span className="sr-only">Главная</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Главная</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              asChild
              style={buttonStyle}
              className="hover:shadow-lg transition-all hover:scale-105"
            >
              <Link to="/handbook">
                <BookMarked className="size-4" />
                <span className="sr-only">Руководство игрока</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Руководство игрока</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              asChild
              style={buttonStyle}
              className="hover:shadow-lg transition-all hover:scale-105"
            >
              <Link to="/spellbook">
                <Scroll className="size-4" />
                <span className="sr-only">Книга заклинаний</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Книга заклинаний</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              asChild
              style={buttonStyle}
              className="hover:shadow-lg transition-all hover:scale-105"
            >
              <Link to="/character-creation">
                <Wand2 className="size-4" />
                <span className="sr-only">Создание персонажа</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Создание персонажа</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Добавляем кнопку кубиков в навигацию */}
        <DiceDrawer />
        
        {currentUser ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  asChild
                  style={buttonStyle}
                  className="hover:shadow-lg transition-all hover:scale-105"
                >
                  <Link to="/profile">
                    <User className="size-4" />
                    <span className="sr-only">Профиль</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Профиль</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  style={buttonStyle}
                  className="hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => logout()}
                >
                  <LogOut className="size-4" />
                  <span className="sr-only">Выход</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Выйти из системы</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                asChild
                style={buttonStyle}
                className="hover:shadow-lg transition-all hover:scale-105"
              >
                <Link to="/auth">
                  <LogIn className="size-4" />
                  <span className="sr-only">Вход/Регистрация</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Вход/Регистрация</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {isDM && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  asChild
                  style={buttonStyle}
                  className="hover:shadow-lg transition-all hover:scale-105"
                >
                  <Link to="/dm">
                    <BookOpen className="size-4" />
                    <span className="sr-only">Панель Мастера</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Панель Мастера</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  asChild
                  style={buttonStyle}
                  className="hover:shadow-lg transition-all hover:scale-105"
                >
                  <Link to="/battle">
                    <Map className="size-4" />
                    <span className="sr-only">Боевая карта</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Боевая карта</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  );
};

export default NavigationButtons;
