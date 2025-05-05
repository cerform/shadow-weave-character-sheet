
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogIn, User, Shield, UsersRound } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const ProfilePreview = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Если пользователь не авторизован, показываем кнопку входа
  if (!isAuthenticated || !currentUser) {
    return (
      <div 
        className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border flex flex-col justify-center items-center" 
        style={{ 
          borderColor: `${currentTheme.accent}50`,
          minHeight: '12rem',
          boxShadow: `0 4px 20px ${currentTheme.accent}20`
        }}
      >
        <div className="mb-4">
          <User size={48} color={currentTheme.accent} />
        </div>
        <h3 
          className="text-lg font-medium mb-2"
          style={{ color: currentTheme.textColor }}
        >
          Вход не выполнен
        </h3>
        <p 
          className="text-sm mb-4 text-center"
          style={{ color: `${currentTheme.textColor}80` }}
        >
          Войдите в аккаунт, чтобы получить доступ ко всем функциям
        </p>
        <Button 
          variant="outline" 
          className="gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
          onClick={() => navigate('/auth')}
        >
          <LogIn size={16} />
          Войти
        </Button>
      </div>
    );
  }
  
  // Определяем аватар пользователя или генерируем на основе имени
  const avatarUrl = currentUser.photoURL || 
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.username || currentUser.email}`;
  
  return (
    <div 
      className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border"
      style={{ 
        borderColor: `${currentTheme.accent}50`,
        boxShadow: `0 4px 20px ${currentTheme.accent}20`
      }}
    >
      <div className="flex items-center gap-4">
        <Avatar 
          className="h-14 w-14 border-2"
          style={{ borderColor: currentTheme.accent }}
        >
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {(currentUser.username || currentUser.email || "").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 
            className="text-lg font-bold"
            style={{ color: currentTheme.textColor }}
          >
            {currentUser.username || currentUser.displayName || currentUser.email || "Искатель приключений"}
          </h3>
          <p 
            className="text-sm"
            style={{ color: `${currentTheme.textColor}80` }}
          >
            {currentUser.isDM ? "Мастер Подземелий" : "Игрок"}
          </p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
          onClick={() => navigate('/profile')}
        >
          <User size={14} />
          Профиль
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
          onClick={() => navigate('/characters')}
        >
          <UsersRound size={14} />
          Персонажи
        </Button>
        
        {currentUser.isDM && (
          <Button 
            variant="outline"
            size="sm"
            className="w-full col-span-2 gap-2 mt-1"
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
            onClick={() => navigate('/dm')}
          >
            <Shield size={14} />
            Панель Мастера
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;
