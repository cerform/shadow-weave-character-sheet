
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCharacter } from '@/contexts/CharacterContext';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ChevronDown, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
// Removed - import { diagnoseCharacterLoading } from '@/utils/characterLoadingDebug';

const CharactersPageDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { characters, error, loading, refreshCharacters } = useCharacter();
  
  useEffect(() => {
    // Автоматически собираем данные о возможных проблемах
    const possibleErrors: string[] = [];
    
    if (!isAuthenticated) {
      possibleErrors.push('Пользователь не авторизован');
    }
    
    if (error) {
      possibleErrors.push(`Ошибка при загрузке персонажей: ${typeof error === 'string' ? error : 'Неизвестная ошибка'}`);
    }
    
    if (loading) {
      possibleErrors.push('Идёт загрузка персонажей');
    } else if (characters.length === 0 && isAuthenticated) {
      possibleErrors.push('Персонажи отсутствуют в списке');
    }
    
    setErrors(possibleErrors);
  }, [isAuthenticated, error, loading, characters]);

  const runDiagnostics = async () => {
    setIsChecking(true);
    
    try {
      // Простая диагностика без внешней зависимости
      const results = {
        success: isAuthenticated && !error,
        error: error || (!isAuthenticated ? 'Пользователь не авторизован' : null),
        debug: {
          isAuthenticated,
          userId: user?.uid,
          charactersCount: characters.length,
          loading,
          error: error
        }
      };
      
      setDebugResults(results);
      
      if (results.success) {
        toast.success('Диагностика пройдена успешно');
      } else {
        toast.error(`Обнаружена проблема: ${results.error}`);
      }
    } catch (e) {
      const errorMessage = typeof e === 'string' ? e : (e as Error)?.message || 'Неизвестная ошибка диагностики';
      toast.error(`Ошибка при запуске диагностики: ${errorMessage}`);
    } finally {
      setIsChecking(false);
    }
  };

  // Если ошибок нет и отладочная панель не открыта, не отображаем её
  if (errors.length === 0 && !isOpen) {
    return null;
  }

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="mb-4 bg-gradient-to-r from-amber-900/10 to-amber-800/20 rounded-lg border border-amber-500/30"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 cursor-pointer">
          <div className="flex items-center gap-2">
            {errors.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            ) : (
              <Info className="h-5 w-5 text-blue-400" />
            )}
            <h3 className="font-medium">
              {errors.length > 0 ? 'Отладка страницы персонажей' : 'Диагностика загрузки'}
            </h3>
            {errors.length > 0 && (
              <Badge variant="destructive" className="bg-amber-600">
                {errors.length} {errors.length === 1 ? 'проблема' : 
                                (errors.length > 1 && errors.length < 5) ? 'проблемы' : 'проблем'}
              </Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Диагностические данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Статус авторизации:</p>
                <Badge variant={isAuthenticated ? 'success' : 'destructive'}>
                  {isAuthenticated ? 'Авторизован' : 'Не авторизован'}
                </Badge>
                {isAuthenticated && user && (
                  <p className="text-xs mt-1">ID пользователя: {user.uid}</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium mb-1">Статус загрузки персонажей:</p>
                <Badge variant={loading ? 'outline' : (error ? 'destructive' : 'success')}>
                  {loading ? 'Загрузка...' : (error ? 'Ошибка' : 'Загружено')}
                </Badge>
                <p className="text-xs mt-1">
                  Количество загруженных персонажей: {characters?.length || 0}
                </p>
              </div>
              
              {error && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-red-500 mb-1">Ошибка загрузки:</p>
                    <pre className="text-xs bg-black/20 p-2 rounded overflow-auto max-h-24">
                      {typeof error === 'string' ? error : 'Неизвестная ошибка'}
                    </pre>
                  </div>
                </>
              )}
              
              {debugResults && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Результаты диагностики:</p>
                    <Badge variant={debugResults.success ? 'success' : 'destructive'}>
                      {debugResults.success ? 'Успешно' : 'Проблема'}
                    </Badge>
                    
                    {!debugResults.success && debugResults.error && (
                      <p className="text-xs mt-1 text-red-400">
                        {debugResults.error}
                      </p>
                    )}
                    
                    {debugResults.debug && (
                      <pre className="text-xs bg-black/20 mt-2 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(debugResults.debug, null, 2)}
                      </pre>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={refreshCharacters}
                disabled={loading}
              >
                Обновить список
              </Button>
              
              <Button
                size="sm"
                onClick={runDiagnostics}
                disabled={isChecking}
                variant={errors.length > 0 ? 'destructive' : 'outline'}
              >
                {isChecking ? 'Проверка...' : 'Запустить диагностику'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CharactersPageDebugger;
