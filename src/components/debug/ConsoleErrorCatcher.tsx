
import React, { useEffect, useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Тип для отслеживаемых ошибок консоли
interface CaughtError {
  message: string;
  timestamp: Date;
  stack?: string;
}

const ConsoleErrorCatcher: React.FC = () => {
  const [errors, setErrors] = useState<CaughtError[]>([]);
  const [warnings, setWarnings] = useState<CaughtError[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    // Сохраняем оригинальные методы консоли
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Перехватываем console.error
    console.error = (...args: any[]) => {
      // Вызываем оригинальный метод
      originalConsoleError.apply(console, args);
      
      // Создаем объект ошибки
      const errorMessage = args.map(arg => 
        typeof arg === 'string' ? arg : 
        arg instanceof Error ? arg.message : 
        JSON.stringify(arg)
      ).join(' ');
      
      const errorObj: CaughtError = {
        message: errorMessage,
        timestamp: new Date(),
        stack: args.find(arg => arg instanceof Error)?.stack
      };
      
      // Добавляем ошибку в состояние
      setErrors(prev => [...prev, errorObj]);
    };
    
    // Перехватываем console.warn
    console.warn = (...args: any[]) => {
      // Вызываем оригинальный метод
      originalConsoleWarn.apply(console, args);
      
      // Создаем объект предупреждения
      const warnMessage = args.map(arg => 
        typeof arg === 'string' ? arg : 
        JSON.stringify(arg)
      ).join(' ');
      
      const warnObj: CaughtError = {
        message: warnMessage,
        timestamp: new Date()
      };
      
      // Добавляем предупреждение в состояние
      setWarnings(prev => [...prev, warnObj]);
    };
    
    // Восстанавливаем оригинальные методы при размонтировании
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  // Если нет ошибок и предупреждений, не отображаем компонент
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }
  
  return (
    <Card className={`mb-4 ${errors.length > 0 ? 'bg-red-900/30 border-red-600/50' : 'bg-amber-900/30 border-amber-600/50'}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errors.length > 0 ? (
              <AlertCircle size={18} className="text-red-400" />
            ) : (
              <Check size={18} className="text-amber-400" />
            )}
            
            <span className={errors.length > 0 ? 'text-red-200' : 'text-amber-200'}>
              {errors.length > 0 
                ? `Перехвачено ${errors.length} ошибок консоли` 
                : `Перехвачено ${warnings.length} предупреждений`}
            </span>
          </div>
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-300 hover:underline"
          >
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 space-y-2">
            {errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-300 mb-1">Ошибки:</h4>
                <ul className="space-y-1 text-xs">
                  {errors.map((error, index) => (
                    <li key={`error-${index}`} className="bg-black/30 p-2 rounded">
                      <div>{error.message}</div>
                      {error.stack && (
                        <div className="mt-1 text-gray-400 whitespace-pre-wrap text-[10px]">
                          {error.stack}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-300 mb-1">Предупреждения:</h4>
                <ul className="space-y-1 text-xs">
                  {warnings.map((warning, index) => (
                    <li key={`warn-${index}`} className="bg-black/30 p-2 rounded">
                      {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsoleErrorCatcher;
