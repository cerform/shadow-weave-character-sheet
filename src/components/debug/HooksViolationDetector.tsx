/**
 * Компонент для отладки React Hooks в реальном времени
 * Показывает предупреждения о нарушениях Rules of Hooks
 */

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface HookError {
  message: string;
  stack: string;
  componentStack: string;
  timestamp: number;
}

export const HooksViolationDetector: React.FC = () => {
  const [errors, setErrors] = useState<HookError[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Перехватываем ошибки React
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || '';
      
      // Проверяем на React Error #185
      if (message.includes('error #185') || message.includes('Rules of Hooks')) {
        const error: HookError = {
          message: 'React Error #185: Нарушение Rules of Hooks',
          stack: event.error?.stack || '',
          componentStack: '',
          timestamp: Date.now(),
        };
        
        setErrors(prev => [...prev, error].slice(-10)); // Храним последние 10 ошибок
        
        console.error('🔴 Обнаружено нарушение Rules of Hooks!');
        console.error('Stack:', event.error?.stack);
      }
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, [isActive]);

  const clearErrors = () => {
    setErrors([]);
  };

  const toggleDetector = () => {
    setIsActive(!isActive);
    if (!isActive) {
      console.log('🔍 Hooks Violation Detector активирован');
    }
  };

  if (!isActive && errors.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleDetector}
          variant="outline"
          className="bg-background shadow-lg"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Включить детектор хуков
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              React Hooks Detector
            </span>
            <div className="flex gap-2">
              {errors.length > 0 && (
                <Button
                  onClick={clearErrors}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Активен' : 'Выключен'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Нарушений не обнаружено</AlertTitle>
              <AlertDescription>
                Детектор мониторит React Hooks в реальном времени
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {errors.map((error, index) => (
                <Alert key={error.timestamp} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs">
                    Ошибка #{errors.length - index}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{error.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </p>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">
                            Stack trace
                          </summary>
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {error.stack.slice(0, 200)}...
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={toggleDetector}
              variant={isActive ? 'destructive' : 'default'}
              size="sm"
              className="flex-1"
            >
              {isActive ? 'Выключить' : 'Включить'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-semibold">💡 Как использовать:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Включите детектор перед тестированием</li>
              <li>Взаимодействуйте с приложением</li>
              <li>Смотрите ошибки в реальном времени</li>
              <li>Используйте stack trace для отладки</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
