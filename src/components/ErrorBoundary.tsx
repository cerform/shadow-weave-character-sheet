import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { ErrorLogsService } from '@/services/ErrorLogsService';
import { SentryService } from '@/services/SentryService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  onReset?: () => void;
}

interface ErrorContext {
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  viewport: string;
  errorCount: number;
  previousErrors: string[];
  sessionId: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorContext: ErrorContext | null;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout;
  private errorHistory: string[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorContext: null,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);

    // Сохраняем в историю ошибок
    this.errorHistory.push(`[${new Date().toISOString()}] ${error.message}`);
    if (this.errorHistory.length > 10) {
      this.errorHistory.shift();
    }

    // Создаём детальный контекст ошибки
    const errorContext: ErrorContext = {
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      errorCount: this.state.retryCount + 1,
      previousErrors: [...this.errorHistory],
      sessionId: this.getSessionId(),
    };

    this.setState({ 
      errorInfo, 
      errorContext,
      retryCount: this.state.retryCount + 1,
    });

    // Отправляем в Sentry
    SentryService.captureError(error, {
      level: 'error',
      tags: {
        errorBoundary: 'true',
        retryCount: String(this.state.retryCount),
      },
      extra: {
        ...errorContext,
        componentStack: errorInfo.componentStack,
      },
    });

    // Логируем ошибку в базу данных с полным контекстом
    ErrorLogsService.logFrontendError(error, 'error', {
      ...errorContext,
      errorBoundary: true,
      retryCount: this.state.retryCount,
    }).catch(err => {
      console.error('❌ Не удалось залогировать ошибку в БД:', err);
    });

    // Автоматическое восстановление
    this.attemptRecovery();
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  private attemptRecovery = () => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      console.log(`🔄 Попытка автоматического восстановления (${retryCount + 1}/${maxRetries})...`);
      
      this.setState({ isRetrying: true });

      this.retryTimeout = setTimeout(() => {
        this.handleReset();
      }, retryDelay);
    } else {
      console.log('❌ Превышено максимальное количество попыток восстановления');
    }
  };

  private handleReset = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      showDetails: false,
    });

    this.props.onReset?.();
  };

  private handleManualReset = () => {
    this.setState({ retryCount: 0 });
    this.handleReset();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dm';
  };

  private toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorContext } = this.state;
    
    const errorDetails = JSON.stringify({
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      context: errorContext,
    }, null, 2);

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Не удалось скопировать:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback, maxRetries = 3 } = this.props;
      const { error, errorInfo, errorContext, retryCount, isRetrying, showDetails, copied } = this.state;

      if (fallback) {
        return fallback;
      }

      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-3xl w-full p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <AlertTriangle className="h-16 w-16 mx-auto text-destructive animate-pulse" />
              <h1 className="text-3xl font-bold text-foreground">Произошла ошибка</h1>
              
              {isRetrying && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Попытка восстановления ({retryCount}/{maxRetries})...</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="font-semibold text-destructive mb-2">Сообщение об ошибке:</h3>
                <p className="text-sm font-mono text-foreground">{error.message}</p>
              </div>
            )}

            {/* Context Info */}
            {errorContext && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Время:</span>
                  <p className="font-mono text-xs">{new Date(errorContext.timestamp).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">URL:</span>
                  <p className="font-mono text-xs truncate">{errorContext.url}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Viewport:</span>
                  <p className="font-mono text-xs">{errorContext.viewport}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Session:</span>
                  <p className="font-mono text-xs truncate">{errorContext.sessionId}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={this.handleManualReset} disabled={isRetrying} size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
              <Button onClick={this.handleReload} variant="outline" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Перезагрузить
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" size="lg">
                <Home className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </div>

            {/* Details Toggle */}
            <div className="border-t pt-4">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Скрыть технические детали
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Показать технические детали
                  </>
                )}
              </button>

              {showDetails && (
                <div className="mt-4 space-y-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={this.copyErrorDetails}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать детали
                        </>
                      )}
                    </Button>
                  </div>

                  <Tabs defaultValue="stack" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="stack">Stack Trace</TabsTrigger>
                      <TabsTrigger value="component">Component Stack</TabsTrigger>
                      <TabsTrigger value="history">История</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stack" className="mt-4">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64 font-mono">
                        {error?.stack || 'Стек недоступен'}
                      </pre>
                    </TabsContent>

                    <TabsContent value="component" className="mt-4">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64 font-mono">
                        {errorInfo?.componentStack || 'Component stack недоступен'}
                      </pre>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      <div className="space-y-2">
                        {errorContext?.previousErrors.length ? (
                          errorContext.previousErrors.map((err, idx) => (
                            <div key={idx} className="text-xs bg-muted p-3 rounded font-mono">
                              {err}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Нет предыдущих ошибок
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
