
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Обновляем состояние, чтобы при следующем рендере показать fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку
    console.error('ErrorBoundary перехватил ошибку:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Здесь можно отправить ошибку в сервис аналитики
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Если есть пользовательский fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе используем дефолтный fallback UI
      return (
        <div className="p-6 max-w-xl mx-auto my-8 bg-card rounded-lg border border-red-500/50 shadow-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-4">
            Что-то пошло не так
          </h2>
          
          <div className="bg-black/30 p-4 rounded-md mb-4">
            <p className="text-sm text-white mb-2">Ошибка:</p>
            <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto max-h-32">
              {this.state.error?.toString()}
            </pre>
            
            {this.state.errorInfo && (
              <>
                <p className="text-sm text-white mt-4 mb-2">Стек вызовов:</p>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={this.resetError} 
              variant="default"
            >
              Попробовать снова
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Вернуться на главную
            </Button>
          </div>
        </div>
      );
    }

    // Если ошибок нет, рендерим детей
    return this.props.children;
  }
}

export default ErrorBoundary;
