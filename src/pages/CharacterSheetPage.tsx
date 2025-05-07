
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character } from '@/types/character';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import MobileCharacterSheet from '@/components/character-sheet/MobileCharacterSheet';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { auth } from '@/lib/firebase';
import { getCurrentUid } from '@/utils/authHelpers';

const CharacterSheetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getCharacterById } = useCharacter(); // Используем контекст персонажей
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем, авторизован ли пользователь
      const userId = getCurrentUid();
      if (!userId) {
        console.log('CharacterSheetPage: Пользователь не авторизован');
        toast({
          title: "Требуется авторизация",
          description: "Пожалуйста, войдите в систему для просмотра персонажей",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        setError('ID персонажа не указан');
        setLoading(false);
        return;
      }
      
      // Проверяем, что пользователь авторизован
      if (!auth.currentUser) {
        console.log('CharacterSheetPage: Пользователь не авторизован');
        setError('Требуется авторизация');
        setLoading(false);
        return;
      }
      
      try {
        console.log('CharacterSheetPage: Загрузка персонажа с ID:', id);
        setLoading(true);
        setError(null);
        
        // Используем метод getCharacterById из контекста CharacterContext
        const data = await getCharacterById(id);
        
        if (!data) {
          console.error('CharacterSheetPage: Персонаж не найден');
          setError('Персонаж не найден');
          toast({
            title: "Ошибка",
            description: "Персонаж не найден или у вас нет доступа",
            variant: "destructive",
          });
        } else {
          console.log('CharacterSheetPage: Персонаж успешно загружен:', data.name);
          setCharacter(data);
        }
      } catch (error: any) {
        console.error('CharacterSheetPage: Ошибка загрузки персонажа:', error);
        
        // Специальная обработка ошибки доступа
        if (error.code === 'permission-denied') {
          setError('У вас нет доступа к этому персонажу');
          toast({
            title: "Ошибка доступа",
            description: "У вас нет прав для просмотра этого персонажа",
            variant: "destructive",
          });
        } else {
          setError('Ошибка при загрузке персонажа');
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить персонажа",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadCharacter();
  }, [id, toast, getCharacterById]);
  
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    if (character) {
      const updatedCharacter = { ...character, ...updates };
      setCharacter(updatedCharacter);
      
      // Здесь можно добавить логику для сохранения обновлений на сервере
      console.log('Character updated:', updatedCharacter);
    }
  };
  
  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex flex-col justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
               style={{ borderColor: currentTheme.accent }}>
          </div>
          <p className="mt-4 text-lg" style={{ color: currentTheme.textColor }}>
            Загрузка персонажа...
          </p>
        </div>
      </BackgroundWrapper>
    );
  }
  
  if (error || !character) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex flex-col justify-center items-center p-8">
          <Card className="max-w-md w-full bg-black/70">
            <CardHeader>
              <CardTitle className="text-red-500">
                Ошибка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">{error || 'Персонаж не найден'}</p>
              <Button onClick={() => navigate('/characters')} className="w-full">
                <ArrowLeft size={16} className="mr-2" />
                Вернуться к списку персонажей
              </Button>
            </CardContent>
          </Card>
        </div>
      </BackgroundWrapper>
    );
  }
  
  return (
    <BackgroundWrapper>
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate('/characters')}>
            <ArrowLeft size={16} className="mr-2" />
            Назад к списку
          </Button>
        </div>
        
        {isMobile ? (
          <MobileCharacterSheet character={character} onUpdate={handleUpdateCharacter} />
        ) : (
          <CharacterSheet character={character} onUpdate={handleUpdateCharacter} />
        )}
      </div>
    </BackgroundWrapper>
  );
};

export default CharacterSheetPage;
