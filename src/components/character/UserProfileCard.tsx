
import React from 'react';
import { UserType } from '@/types/auth';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { User } from "lucide-react";

interface UserProfileCardProps {
  user: UserType | null;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  avatarUrl: string;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  username, 
  setUsername, 
  avatarUrl, 
  setAvatarUrl 
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Get initials from username
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Custom theme for the profile card
  const cardTheme = {
    accent: currentTheme.accent,
    textColor: currentTheme.textColor,
    background: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)',
    foreground: currentTheme.foreground,
    primary: currentTheme.primary,
    cardBackground: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)',
    secondary: currentTheme.secondary,
    mutedTextColor: currentTheme.mutedTextColor || '#888888',
    name: 'profile'
  };
  
  // Проверка на наличие пользователя
  if (!user) {
    return (
      <Card className="overflow-hidden border" style={{ borderColor: cardTheme.accent + '60', background: cardTheme.background }}>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Пользователь не найден</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden border" style={{ borderColor: cardTheme.accent + '60', background: cardTheme.background }}>
      <div className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-2" style={{ borderColor: cardTheme.accent }}>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={username} />
              ) : (
                <AvatarFallback className="text-xl" style={{ backgroundColor: cardTheme.primary, color: cardTheme.textColor }}>
                  <User size={32} />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: cardTheme.textColor}}>
                Имя пользователя
              </label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30"
                placeholder="Введите имя пользователя"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: cardTheme.textColor}}>
                Email
              </label>
              <Input 
                value={user.email || ""}
                disabled
                className="w-full bg-black/30 text-muted-foreground"
              />
            </div>
            
            {user.role && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: user.isDM ? cardTheme.accent + '40' : cardTheme.secondary + '40' }}>
                  {user.isDM ? 'Мастер' : 'Игрок'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Экспортируем как именованный и как дефолтный экспорт
export { UserProfileCard };
export default UserProfileCard;
