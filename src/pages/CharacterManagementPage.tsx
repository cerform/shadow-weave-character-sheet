
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/contexts/CharacterContext';
import CharactersTable from "@/components/characters/CharactersTable";
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import LoadingState from '@/components/characters/LoadingState';
import { toast } from 'sonner';

const CharacterManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { characters, loading, error, deleteCharacter, getUserCharacters } = useCharacter();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  useEffect(() => {
    if (isAuthenticated) {
      refreshCharacters();
    }
  }, [isAuthenticated]);
  
  const refreshCharacters = async () => {
    try {
      setIsRefreshing(true);
      await getUserCharacters();
    } catch (err) {
      console.error('Ошибка при обновлении списка персонажей:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Ошибка при обновлении списка персонажей: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacter(id);
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Ошибка при удалении персонажа: ${errorMessage}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center p-6">
          <h1 className="text-3xl font-bold mb-6">Требуется авторизация</h1>
          <p className="mb-8">Для управления персонажами необходимо войти в систему</p>
          <Button 
            onClick={() => navigate('/auth', { state: { returnPath: '/character-management' } })}
            className="w-full"
          >
            Войти
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <OBSLayout
        topPanelContent={
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft size={16} className="mr-2" />
                На главную
              </Button>
              <h1 className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
                Управление персонажами
              </h1>
            </div>
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6 max-w-5xl">
          <CharacterNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
              Управление персонажами
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCharacters}
                disabled={isRefreshing || loading}
              >
                <RefreshCw size={16} className={`mr-2 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button
                onClick={() => navigate('/character-creation')}
              >
                <Plus size={16} className="mr-2" />
                Создать персонажа
              </Button>
            </div>
          </div>
          
          {loading && <LoadingState />}
          
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={typeof error === 'string' ? error : (error as Error).message} 
              onRetry={refreshCharacters} 
            />
          )}
          
          {!loading && !error && (
            <CharactersTable
              characters={characters || []}
              onDelete={handleDeleteCharacter}
            />
          )}
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default CharacterManagementPage;
