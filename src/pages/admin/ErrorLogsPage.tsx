import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Trash2, RefreshCw, Filter, Search, Database, Server, Globe, Lock, Wifi, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogsService, ErrorLog, ErrorCategory, ErrorSeverity } from '@/services/ErrorLogsService';
import { ErrorDebugService } from '@/services/ErrorDebugService';
import { useProtectedRoute } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ErrorLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading } = useProtectedRoute();

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'all'>('all');
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedCategory, selectedSeverity, showResolved, searchQuery]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await ErrorLogsService.getErrorLogs();
      setLogs(data);
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить логи ошибок',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await ErrorLogsService.getErrorStats();
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    filtered = filtered.filter(log => log.resolved === showResolved);

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleMarkAsResolved = async (errorId: string) => {
    try {
      await ErrorLogsService.markAsResolved(errorId);
      toast({
        title: 'Успешно',
        description: 'Ошибка помечена как исправленная',
      });
      loadLogs();
      loadStats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (errorId: string) => {
    try {
      await ErrorLogsService.deleteErrorLog(errorId);
      toast({
        title: 'Успешно',
        description: 'Лог удален',
      });
      loadLogs();
      loadStats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить лог',
        variant: 'destructive',
      });
    }
  };

  const handleCleanup = async () => {
    try {
      const count = await ErrorLogsService.cleanupOldLogs();
      toast({
        title: 'Успешно',
        description: `Удалено старых логов: ${count}`,
      });
      loadLogs();
      loadStats();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось очистить логи',
        variant: 'destructive',
      });
    }
  };

  const handleAiDebug = async (errorLog: ErrorLog) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await ErrorDebugService.analyzeError(errorLog);
      setAiAnalysis(analysis);
      toast({
        title: 'AI-анализ готов',
        description: 'Проверьте результаты ниже',
      });
    } catch (error) {
      console.error('Ошибка AI-анализа:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить AI-анализ',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'frontend':
        return <Globe className="h-4 w-4" />;
      case 'backend':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'auth':
        return <Lock className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getCategoryName = (category: ErrorCategory) => {
    const names: Record<ErrorCategory, string> = {
      frontend: 'Фронтенд',
      backend: 'Бэкенд',
      database: 'База данных',
      auth: 'Авторизация',
      api: 'API',
      network: 'Сеть',
      other: 'Другое',
    };
    return names[category];
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Логи ошибок</h1>
              <p className="text-muted-foreground">
                Мониторинг и управление ошибками системы
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
            >
              Очистить старые
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadLogs();
                loadStats();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Всего ошибок</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Неисправлено</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{stats.unresolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Исправлено</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Критических</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {stats.bySeverity.critical || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="frontend">Фронтенд</SelectItem>
                    <SelectItem value="backend">Бэкенд</SelectItem>
                    <SelectItem value="database">База данных</SelectItem>
                    <SelectItem value="auth">Авторизация</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="network">Сеть</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Серьезность</label>
                <Select value={selectedSeverity} onValueChange={(value: any) => setSelectedSeverity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <Select value={showResolved ? 'resolved' : 'unresolved'} onValueChange={(value) => setShowResolved(value === 'resolved')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unresolved">Неисправлено</SelectItem>
                    <SelectItem value="resolved">Исправлено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по сообщению..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Логи ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <Card
                    key={log.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getCategoryIcon(log.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={getSeverityColor(log.severity)}>
                                {log.severity}
                              </Badge>
                              <Badge variant="outline">
                                {getCategoryName(log.category)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate">
                              {log.message}
                            </p>
                            {log.user_email && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Пользователь: {log.user_email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!log.resolved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsResolved(log.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(log.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Логов не найдено
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Error Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => {
        setSelectedLog(null);
        setAiAnalysis(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getCategoryIcon(selectedLog.category)}
              Детали ошибки
            </DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.created_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ru })}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Категория и серьезность</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {getCategoryName(selectedLog.category)}
                  </Badge>
                  <Badge variant="outline" className={getSeverityColor(selectedLog.severity)}>
                    {selectedLog.severity}
                  </Badge>
                  {selectedLog.resolved && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Исправлено
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Сообщение</h4>
                <p className="text-sm bg-secondary p-3 rounded-md">{selectedLog.message}</p>
              </div>

              {selectedLog.stack_trace && (
                <div>
                  <h4 className="font-medium mb-2">Stack Trace</h4>
                  <pre className="text-xs bg-secondary p-3 rounded-md overflow-x-auto">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              {selectedLog.url && (
                <div>
                  <h4 className="font-medium mb-2">URL</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.url}</p>
                </div>
              )}

              {selectedLog.user_email && (
                <div>
                  <h4 className="font-medium mb-2">Пользователь</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.user_email}</p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Метаданные</h4>
                  <pre className="text-xs bg-secondary p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.resolved && selectedLog.resolved_at && (
                <div>
                  <h4 className="font-medium mb-2">Исправлено</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLog.resolved_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ru })}
                  </p>
                </div>
              )}

              {/* AI Debug Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Дебаггер
                </h4>
                
                <Button
                  className="w-full mb-3"
                  onClick={() => handleAiDebug(selectedLog)}
                  disabled={isAnalyzing}
                  variant="default"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Анализ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Анализировать с AI
                    </>
                  )}
                </Button>
                
                {aiAnalysis && (
                  <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {aiAnalysis}
                    </pre>
                  </div>
                )}
                
                {!aiAnalysis && !isAnalyzing && (
                  <p className="text-sm text-muted-foreground">
                    Нажмите кнопку "Анализировать с AI" для получения рекомендаций по исправлению ошибки
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {!selectedLog.resolved && (
                  <Button
                    onClick={() => {
                      handleMarkAsResolved(selectedLog.id);
                      setSelectedLog(null);
                      setAiAnalysis(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Пометить как исправленное
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedLog.id);
                    setSelectedLog(null);
                    setAiAnalysis(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogsPage;
