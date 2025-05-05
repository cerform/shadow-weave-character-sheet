
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, User, ArrowLeft } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Если пользователь не авторизован, предлагаем войти
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">Требуется авторизация</h1>
          <p className="mb-8">Для доступа к персонажам необходимо войти в систему</p>
          <Button 
            onClick={() => navigate('/auth', { state: { returnPath: '/characters' } })}
            className="w-full"
          >
            Войти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OBSLayout
      topPanelContent={
        <div className="flex justify-between items-center p-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            На главную
          </Button>
          
          <h1 
            className="text-xl font-bold"
            style={{ color: currentTheme.textColor }}
          >
            Мои персонажи
          </h1>
          
          <IconOnlyNavigation includeThemeSelector />
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Верхняя панель */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
              Персонажи игрока {user?.displayName || user?.username || ""}
            </h2>
            <Button
              onClick={() => navigate('/character-creation')}
              className="gap-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText || '#FFFFFF',
              }}
            >
              <Plus size={16} />
              Создать персонажа
            </Button>
          </div>

          {/* Пустое состояние */}
          <div 
            className="border rounded-xl p-10 text-center"
            style={{ borderColor: `${currentTheme.accent}30` }}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <User 
                size={32} 
                style={{ color: currentTheme.accent }} 
              />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.textColor }}>
              У вас пока нет персонажей
            </h3>
            <p className="text-muted-foreground mb-6">
              Создайте своего первого персонажа, чтобы начать приключение
            </p>
            <Button
              onClick={() => navigate('/character-creation')}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText || '#FFFFFF',
              }}
            >
              Создать персонажа
            </Button>
          </div>
        </div>
      </div>
    </OBSLayout>
  );
};

export default CharactersListPage;
