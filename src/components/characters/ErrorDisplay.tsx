
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry?: () => void;
  technicalDetails?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errorMessage, 
  onRetry,
  technicalDetails
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Попробуем извлечь полезную информацию из сообщения ошибки
  let suggestedAction = '';
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    suggestedAction = 'Проверьте, что вы авторизованы и обладаете необходимыми правами доступа.';
  } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    suggestedAction = 'Проверьте подключение к интернету и повторите попытку.';
  } else if (errorMessage.includes('not found')) {
    suggestedAction = 'Возможно, запрашиваемый ресурс был удален или перемещен.';
  } else if (errorMessage.includes('timeout')) {
    suggestedAction = 'Превышено время ожидания ответа. Повторите попытку позже.';
  } else {
    suggestedAction = 'Обновите страницу или повторите последнее действие.';
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Ошибка</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{errorMessage}</p>
        
        {suggestedAction && (
          <div className="text-sm p-2 bg-red-950/30 border border-red-800 rounded">
            <strong>Рекомендация:</strong> {suggestedAction}
          </div>
        )}
        
        {(technicalDetails || user) && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mt-2">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 bg-transparent border-red-800 hover:bg-red-900/30 text-xs"
              >
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Техническая информация
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 mt-2 bg-black/40 border border-red-900 rounded text-xs">
                <div className="mb-2">
                  <strong>Пользователь:</strong> {user?.displayName || 'Неизвестно'}
                </div>
                <div className="mb-2">
                  <strong>ID пользователя:</strong> {user?.uid || 'Неизвестно'}
                </div>
                <div className="mb-2">
                  <strong>Время:</strong> {new Date().toLocaleString()}
                </div>
                <div className="mb-2">
                  <strong>URL:</strong> {window.location.href}
                </div>
                {technicalDetails && (
                  <pre className="whitespace-pre-wrap mt-2 p-2 bg-black/40 text-red-400 rounded">
                    {typeof technicalDetails === 'string' 
                      ? technicalDetails 
                      : JSON.stringify(technicalDetails, null, 2)}
                  </pre>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="w-fit flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Повторить
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
