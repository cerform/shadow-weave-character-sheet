import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, Database } from 'lucide-react';
import { clearAllLocalStorage, clearCharacterCreationProgress, clearFirebaseCache } from '@/utils/clearStorage';

const StorageCleaner: React.FC = () => {
  const handleClearAll = () => {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      clearAllLocalStorage();
    }
  };

  const handleClearCharacterProgress = () => {
    if (confirm('Очистить прогресс создания персонажа?')) {
      clearCharacterCreationProgress();
    }
  };

  const handleClearFirebaseCache = () => {
    if (confirm('Очистить кэш Firebase?')) {
      clearFirebaseCache();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Очистка хранилища
          </CardTitle>
          <CardDescription>
            Инструменты для очистки локальных данных
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Очистка данных поможет решить проблемы с загрузкой и состоянием приложения.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleClearCharacterProgress}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Очистить прогресс создания
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleClearFirebaseCache}
            >
              <Database className="h-4 w-4 mr-2" />
              Очистить кэш Firebase
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Полная очистка
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Сочетание клавиш: Ctrl+Shift+Del в браузере
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageCleaner;