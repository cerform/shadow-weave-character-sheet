import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ErrorLogsService } from '@/services/ErrorLogsService';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    
    // Логируем ошибку в базу данных
    ErrorLogsService.logFrontendError(error, 'error', {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    }).catch(err => {
      console.error('❌ Не удалось залогировать ошибку в БД:', err);
    });
  }

  render() {
    if (this.state.hasError) {
      // Если есть кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Иначе показываем стандартную страницу ошибки
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <div className="max-w-md text-center space-y-4 p-6">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
            <p className="text-muted-foreground">
              Произошла ошибка при отображении страницы
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-secondary p-4 rounded overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <div className="space-x-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Перезагрузить страницу
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/dm';
                }}
              >
                На главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
