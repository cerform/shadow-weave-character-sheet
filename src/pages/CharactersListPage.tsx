
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, User, ArrowLeft, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getAllCharacters, deleteCharacter } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      loadCharacters();
    }
  }, [isAuthenticated]);

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedCharacters = await getAllCharacters();
      setCharacters(fetchedCharacters);
      console.log('Loaded characters:', fetchedCharacters);
    } catch (err) {
      console.error('Ошибка при загрузке персонажей:', err);
      setError('Не удалось загрузить персонажей');
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteCharacter(id);
      toast.success('Персонаж успешно удален');
      
      // Обновляем список персонажей
      setCharacters(prevChars => prevChars.filter(char => char.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      toast.error('Не удалось удалить персонажа');
    } finally {
      setDeletingId(null);
    }
  };

  // Функция открытия персонажа
  const handleViewCharacter = (id: string) => {
    // Сохраняем ID последнего выбранного персонажа
    localStorage.setItem('last-selected-character', id);
    navigate(`/character/${id}`);
  };

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

          {/* Загрузка */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-primary mr-2" />
              <span>Загрузка персонажей...</span>
            </div>
          )}
          
          {/* Ошибка */}
          {error && !loading && (
            <Card className="border-red-500 bg-black/50">
              <CardContent className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={loadCharacters}>Повторить загрузку</Button>
              </CardContent>
            </Card>
          )}
          
          {/* Список персонажей */}
          {!loading && !error && characters.length > 0 && (
            <Card className="bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Список персонажей</CardTitle>
                <CardDescription>Всего персонажей: {characters.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя персонажа</TableHead>
                      <TableHead>Класс</TableHead>
                      <TableHead>Раса</TableHead>
                      <TableHead>Уровень</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {characters.map((character) => (
                      <TableRow key={character.id}>
                        <TableCell className="font-medium">{character.name}</TableCell>
                        <TableCell>{character.className || character.class}</TableCell>
                        <TableCell>{character.race}</TableCell>
                        <TableCell>{character.level}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewCharacter(character.id)}
                            title="Открыть"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/character-edit/${character.id}`)}
                            title="Редактировать"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCharacter(character.id)}
                            disabled={deletingId === character.id}
                            className="text-red-500 hover:text-red-700"
                            title="Удалить"
                          >
                            {deletingId === character.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Пустое состояние */}
          {!loading && !error && characters.length === 0 && (
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
          )}
        </div>
      </div>
    </OBSLayout>
  );
};

export default CharactersListPage;
