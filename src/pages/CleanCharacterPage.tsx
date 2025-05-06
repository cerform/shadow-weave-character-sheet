
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCharactersByUserId } from '@/services/characterService';
import { getCurrentUid } from '@/utils/authHelpers';
import { Character } from '@/types/character';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CleanCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Загрузка персонажей напрямую из сервиса, минуя контекст
  useEffect(() => {
    async function loadCharacters() {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем ID пользователя
        const userId = getCurrentUid();
        if (!userId) {
          setError('Пользователь не авторизован');
          setLoading(false);
          return;
        }
        
        // Сохраняем отладочную информацию
        setDebugInfo({ userId });
        
        // Загружаем персонажей
        console.log('Загрузка персонажей для пользователя:', userId);
        const loadedCharacters = await getCharactersByUserId(userId);
        console.log('Загружено персонажей:', loadedCharacters.length);
        
        // Обновляем отладочную информацию
        setDebugInfo(prev => ({ 
          ...prev, 
          charactersCount: loadedCharacters.length,
          characterIds: loadedCharacters.map(c => c.id),
        }));
        
        // Устанавливаем персонажей
        setCharacters(loadedCharacters);
      } catch (err) {
        console.error('Ошибка загрузки персонажей:', err);
        setError(`Не удалось загрузить персонажей: ${err}`);
        toast.error('Ошибка загрузки персонажей');
      } finally {
        setLoading(false);
      }
    }
    
    loadCharacters();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Тестовая страница персонажей</h1>
      
      <Card className="mb-6 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Альтернативная загрузка</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" />
              <span>Загрузка персонажей...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 p-3 rounded border border-red-500/40 flex items-start gap-2">
              <AlertCircle className="text-red-400 shrink-0 mt-1" />
              <div>
                <p className="font-medium text-red-300 mb-1">Ошибка</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">Загружено персонажей: {characters.length}</p>
              
              {characters.length > 0 ? (
                <ul className="space-y-2">
                  {characters.map(char => (
                    <li key={char.id} className="p-3 bg-primary/10 rounded border border-primary/20">
                      {char.name || 'Без имени'} - {char.className || char.class || 'Без класса'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Персонажи не найдены</p>
              )}
            </div>
          )}
          
          {debugInfo && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Отладочная информация:</h3>
              <pre className="text-xs bg-black/40 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/characters')}>
          Вернуться к списку персонажей
        </Button>
        <Button onClick={() => window.location.reload()}>
          Обновить страницу
        </Button>
      </div>
    </div>
  );
};

export default CleanCharacterPage;
