
import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CapturedError {
  message: string;
  timestamp: string;
  stack?: string;
}

const ConsoleErrorCatcher: React.FC = () => {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [warnings, setWarnings] = useState<CapturedError[]>([]);

  useEffect(() => {
    // Сохраняем оригинальные методы консоли
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Переопределяем console.error
    console.error = function(...args) {
      // Вызываем оригинальный метод
      originalConsoleError.apply(console, args);
      
      // Добавляем ошибку в наш список
      const errorMessage = args
        .map(arg => {
          if (arg instanceof Error) return arg.message;
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        })
        .join(' ');
      
      setErrors(prev => [
        ...prev, 
        { 
          message: errorMessage,
          timestamp: new Date().toISOString(),
          stack: args[0] instanceof Error ? args[0].stack : undefined
        }
      ].slice(-5)); // Хранить только последние 5 ошибок
    };
    
    // Переопределяем console.warn
    console.warn = function(...args) {
      // Вызываем оригинальный метод
      originalConsoleWarn.apply(console, args);
      
      // Добавляем предупреждение в наш список
      const warnMessage = args
        .map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        })
        .join(' ');
      
      setWarnings(prev => [
        ...prev, 
        { 
          message: warnMessage,
          timestamp: new Date().toISOString() 
        }
      ].slice(-5)); // Хранить только последние 5 предупреждений
    };
    
    // Восстанавливаем оригинальные методы при размонтировании
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-4">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Ошибки консоли <span className="text-xs bg-red-900 px-1.5 py-0.5 rounded-full">{errors.length}</span>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto text-xs">
              {errors.map((error, index) => (
                <div key={index} className="p-2 border border-red-900 bg-red-950 rounded">
                  <div className="font-mono">{error.message}</div>
                  {error.stack && (
                    <details>
                      <summary className="cursor-pointer text-red-400">Stack trace</summary>
                      <pre className="whitespace-pre-wrap text-[10px] mt-1 pl-2 border-l border-red-800">{error.stack}</pre>
                    </details>
                  )}
                  <div className="text-[10px] text-red-500 mt-1">{new Date(error.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Alert variant="warning" className="border-amber-500 bg-amber-950/40">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="flex items-center gap-2 text-amber-500">
            Предупреждения <span className="text-xs bg-amber-900 px-1.5 py-0.5 rounded-full">{warnings.length}</span>
          </AlertTitle>
          <AlertDescription className="text-amber-300">
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto text-xs">
              {warnings.map((warning, index) => (
                <div key={index} className="p-2 border border-amber-900 bg-amber-950/60 rounded">
                  <div className="font-mono">{warning.message}</div>
                  <div className="text-[10px] text-amber-600 mt-1">{new Date(warning.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConsoleErrorCatcher;
