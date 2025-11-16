import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Trash2, RefreshCw, Filter, Search, Database, Server, Globe, Lock, Wifi, HelpCircle, Sparkles, Copy, Check, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
import { HookErrorsTab } from '@/components/admin/HookErrorsTab';

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
  const [autoFixSuggestion, setAutoFixSuggestion] = useState<any>(null);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyingFix, setApplyingFix] = useState(false);

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

  const handleAutoFix = async (errorLogId: string) => {
    setIsAutoFixing(true);
    setAutoFixSuggestion(null);
    try {
      const fix = await ErrorDebugService.getAutoFixSuggestion(errorLogId);
      setAutoFixSuggestion(fix);
      toast({
        title: fix.canAutoFix ? '✅ Решение найдено!' : 'Рекомендации готовы',
        description: fix.canAutoFix 
          ? 'Предложено автоматическое исправление' 
          : 'Получены рекомендации по исправлению',
      });
    } catch (error) {
      console.error('Ошибка автоисправления:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить предложение по исправлению',
        variant: 'destructive',
      });
    } finally {
      setIsAutoFixing(false);
    }
  };

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      toast({
        title: '✅ Скопировано',
        description: 'Код скопирован в буфер обмена',
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось скопировать код',
        variant: 'destructive',
      });
    }
  };

  const handleApplyFix = async (codeChange: any) => {
    setApplyingFix(true);
    try {
      // Копируем код в буфер обмена для ручного применения
      await navigator.clipboard.writeText(codeChange.suggestion);
      
      toast({
        title: '✅ Код готов к применению',
        description: `Код для файла ${codeChange.file} скопирован в буфер обмена. Откройте файл и примените изменения.`,
        duration: 5000,
      });

      // Помечаем ошибку как исправленную после применения фикса
      if (selectedLog?.id) {
        await handleMarkAsResolved(selectedLog.id);
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось подготовить код к применению',
        variant: 'destructive',
      });
    } finally {
      setApplyingFix(false);
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

  const handleExportCSV = () => {
    try {
      // Подготовка данных для CSV
      const headers = ['ID', 'Дата', 'Категория', 'Серьезность', 'Сообщение', 'URL', 'Пользователь', 'Исправлено'];
      const csvData = filteredLogs.map(log => [
        log.id,
        format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss'),
        getCategoryName(log.category),
        log.severity,
        log.message.replace(/"/g, '""'), // Экранирование кавычек
        log.url || '',
        log.user_email || 'Анонимный',
        log.resolved ? 'Да' : 'Нет'
      ]);

      // Формирование CSV строки
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Создание и скачивание файла
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `error-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: '✅ Экспорт выполнен',
        description: `Экспортировано ${filteredLogs.length} записей в CSV`,
      });
    } catch (error) {
      console.error('Ошибка экспорта CSV:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось экспортировать данные в CSV',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
    try {
      // Подготовка данных для JSON
      const exportData = filteredLogs.map(log => ({
        id: log.id,
        created_at: log.created_at,
        category: log.category,
        category_name: getCategoryName(log.category),
        severity: log.severity,
        message: log.message,
        stack_trace: log.stack_trace,
        url: log.url,
        user_id: log.user_id,
        user_email: log.user_email,
        user_agent: log.user_agent,
        metadata: log.metadata,
        resolved: log.resolved,
        resolved_by: log.resolved_by,
        resolved_at: log.resolved_at,
      }));

      // Создание и скачивание файла
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `error-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: '✅ Экспорт выполнен',
        description: `Экспортировано ${filteredLogs.length} записей в JSON`,
      });
    } catch (error) {
      console.error('Ошибка экспорта JSON:', error);
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось экспортировать данные в JSON',
        variant: 'destructive',
      });
    }
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
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={filteredLogs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
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

        {/* Tabs */}
        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="errors">Ошибки системы</TabsTrigger>
            <TabsTrigger value="hooks">Ошибки хуков</TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="hooks" className="space-y-6">
            <HookErrorsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Error Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => {
        setSelectedLog(null);
        setAiAnalysis(null);
        setAutoFixSuggestion(null);
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw]">
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
            <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
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
                  <div className="max-h-40 overflow-auto bg-secondary p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {selectedLog.message}
                    </p>
                  </div>
                </div>

                {selectedLog.stack_trace && (
                  <div>
                    <h4 className="font-medium mb-2">Stack Trace</h4>
                    <div className="max-h-80 overflow-auto bg-secondary p-3 rounded-md">
                      <pre className="text-xs whitespace-pre break-words">
                        {selectedLog.stack_trace}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.url && (
                  <div>
                    <h4 className="font-medium mb-2">URL</h4>
                    <div className="max-h-24 overflow-auto bg-secondary p-3 rounded-md">
                      <p className="text-sm break-all">{selectedLog.url}</p>
                    </div>
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
                    <div className="max-h-60 overflow-auto bg-secondary p-3 rounded-md">
                      <pre className="text-xs whitespace-pre break-words">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
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
              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Дебаггер
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <Button
                      onClick={() => handleAiDebug(selectedLog)}
                      disabled={isAnalyzing}
                      variant="default"
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Анализ...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Анализировать
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleAutoFix(selectedLog.id)}
                      disabled={isAutoFixing}
                      variant="secondary"
                      className="w-full"
                    >
                      {isAutoFixing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Исправление...
                        </>
                      ) : (
                        <>
                          🔧 Автоисправление
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {aiAnalysis && (
                    <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4 mb-3">
                      <div className="text-xs font-semibold text-primary mb-2">📋 Анализ:</div>
                      <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                        <ReactMarkdown
                          components={{
                            code: ({ node, inline, className, children, ...props }: any) => {
                              const codeString = String(children).replace(/\n$/, '');
                              const codeId = `analysis-code-${Math.random()}`;
                              return inline ? (
                                <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <div className="relative group">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={() => handleCopyCode(codeString, codeId)}
                                  >
                                    {copiedCode === codeId ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            },
                          }}
                        >
                          {aiAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  {autoFixSuggestion && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xs font-semibold text-green-600">
                          {autoFixSuggestion.canAutoFix ? '✅ Решение найдено' : '💡 Рекомендации'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {autoFixSuggestion.fixSteps && autoFixSuggestion.fixSteps.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold mb-1">Шаги исправления:</div>
                            <ol className="text-sm space-y-1 list-decimal list-inside">
                              {autoFixSuggestion.fixSteps.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {autoFixSuggestion.codeChanges && autoFixSuggestion.codeChanges.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold mb-1">Изменения в коде:</div>
                            {autoFixSuggestion.codeChanges.map((change: any, i: number) => {
                              const changeId = `change-${i}`;
                              return (
                                <div key={i} className="bg-secondary/50 rounded p-3 mb-2 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <div className="text-xs font-mono text-primary font-semibold">{change.file}</div>
                                      <div className="text-xs text-muted-foreground mt-1">{change.description}</div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApplyFix(change)}
                                      disabled={applyingFix}
                                      className="ml-2"
                                    >
                                      {applyingFix ? (
                                        <>
                                          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
                                          Применение...
                                        </>
                                      ) : (
                                        <>
                                          ✅ Применить фикс
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="relative group">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                      onClick={() => handleCopyCode(change.suggestion, changeId)}
                                    >
                                      {copiedCode === changeId ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <pre className="text-xs mt-1 bg-background/50 p-3 rounded overflow-x-auto border border-border">
                                      {change.suggestion}
                                    </pre>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {autoFixSuggestion.prevention && (
                          <div>
                            <div className="text-xs font-semibold mb-1">Профилактика:</div>
                            <p className="text-sm text-muted-foreground">{autoFixSuggestion.prevention}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!aiAnalysis && !isAnalyzing && !autoFixSuggestion && !isAutoFixing && (
                    <p className="text-sm text-muted-foreground">
                      Используйте "Анализировать" для детального анализа или "Автоисправление" для получения конкретного решения
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {!selectedLog.resolved && (
                  <Button
                    onClick={() => {
                    handleMarkAsResolved(selectedLog.id);
                      setSelectedLog(null);
                      setAiAnalysis(null);
                      setAutoFixSuggestion(null);
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
                    setAutoFixSuggestion(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogsPage;
