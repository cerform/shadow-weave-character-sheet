// Компонент для импорта монстров из TTG.Club
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TTGClubService } from '@/services/ttgClubService';
import type { Monster } from '@/types/monsters';
import { Download, Search, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TTGClubImporterProps {
  onMonstersImported: (monsters: Monster[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TTGClubImporter: React.FC<TTGClubImporterProps> = ({
  onMonstersImported,
  isOpen,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToLoad, setTotalToLoad] = useState(0);
  const [importedMonsters, setImportedMonsters] = useState<Monster[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMode, setImportMode] = useState<'search' | 'random'>('random');

  const handleRandomImport = async () => {
    setIsLoading(true);
    setProgress(0);
    setImportedMonsters([]);
    
    try {
      const count = 20; // Импортируем 20 случайных монстров
      setTotalToLoad(count);
      
      const monsters = await TTGClubService.importRandomMonsters(count);
      
      setImportedMonsters(monsters);
      onMonstersImported(monsters);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${monsters.length} монстров из TTG.Club`,
      });
    } catch (error) {
      console.error('Ошибка импорта:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать монстров",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleSearchImport = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Введите запрос",
        description: "Введите название монстра для поиска",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setImportedMonsters([]);
    
    try {
      const monsters = await TTGClubService.searchMonsters(searchQuery);
      
      setImportedMonsters(monsters);
      onMonstersImported(monsters);
      
      toast({
        title: "Поиск завершен",
        description: `Найдено ${monsters.length} монстров`,
      });
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось найти монстров",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] m-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Импорт из TTG.Club
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Режимы импорта */}
          <div className="flex gap-2">
            <Button
              variant={importMode === 'random' ? 'default' : 'outline'}
              onClick={() => setImportMode('random')}
              disabled={isLoading}
            >
              Случайный импорт
            </Button>
            <Button
              variant={importMode === 'search' ? 'default' : 'outline'}
              onClick={() => setImportMode('search')}
              disabled={isLoading}
            >
              Поиск монстров
            </Button>
          </div>

          {/* Поиск */}
          {importMode === 'search' && (
            <div className="flex gap-2">
              <Input
                placeholder="Введите название монстра..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchImport()}
              />
              <Button onClick={handleSearchImport} disabled={isLoading || !searchQuery.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Найти
              </Button>
            </div>
          )}

          {/* Случайный импорт */}
          {importMode === 'random' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Импорт 20 случайных монстров из базы данных TTG.Club
              </p>
              <Button onClick={handleRandomImport} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Импортируем...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Импортировать случайных монстров
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Прогресс */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Загружаем монстров...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Результаты */}
          {importedMonsters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">
                  Импортировано {importedMonsters.length} монстров
                </span>
              </div>
              
              <ScrollArea className="h-40 border rounded-md p-2">
                <div className="space-y-1">
                  {importedMonsters.map((monster) => (
                    <div key={monster.id} className="flex items-center justify-between text-sm">
                      <span>{monster.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          CR {monster.challengeRating}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {monster.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Предупреждение */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Примечание:</p>
              <p>
                Данные импортируются с сайта TTG.Club. Процесс может занять некоторое время.
                Импортированные монстры будут добавлены в ваш локальный бестиарий.
              </p>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Закрыть
            </Button>
            {importedMonsters.length > 0 && (
              <Button 
                onClick={() => {
                  onClose();
                  setImportedMonsters([]);
                }}
              >
                Готово
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};