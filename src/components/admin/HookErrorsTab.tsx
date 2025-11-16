import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Trash2, RefreshCw, AlertTriangle, Code2, Search } from 'lucide-react';
import { HookErrorsService, HookViolation } from '@/services/HookErrorsService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const HookErrorsTab: React.FC = () => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<HookViolation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<HookViolation[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadViolations();
  }, []);

  useEffect(() => {
    filterViolations();
  }, [violations, selectedType, searchQuery, showResolved]);

  const loadViolations = () => {
    const data = HookErrorsService.getAll();
    setViolations(data);
    setStats(HookErrorsService.getStats());
  };

  const filterViolations = () => {
    let filtered = [...violations];

    if (selectedType !== 'all') {
      filtered = filtered.filter(v => v.type === selectedType);
    }

    filtered = filtered.filter(v => v.resolved === showResolved);

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredViolations(filtered);
  };

  const handleResolve = (id: string) => {
    HookErrorsService.resolve(id);
    loadViolations();
    toast({
      title: 'Успех',
      description: 'Ошибка помечена как решённая',
    });
  };

  const handleDelete = (id: string) => {
    HookErrorsService.delete(id);
    loadViolations();
    toast({
      title: 'Успех',
      description: 'Ошибка удалена',
    });
  };

  const handleClearAll = () => {
    HookErrorsService.clear();
    loadViolations();
    toast({
      title: 'Успех',
      description: 'Все ошибки очищены',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'map': return 'Hook в .map()';
      case 'conditional': return 'Hook в условии';
      case 'nested_function': return 'Hook во вложенной функции';
      case 'switch': return 'Hook в switch';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'map': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'conditional': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'nested_function': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'switch': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего нарушений</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Нерешённых</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.unresolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Решённых</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>В .map()</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {stats.byType.map}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип нарушения</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="map">Hook в .map()</SelectItem>
                  <SelectItem value="conditional">Hook в условии</SelectItem>
                  <SelectItem value="nested_function">Hook во вложенной функции</SelectItem>
                  <SelectItem value="switch">Hook в switch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Файл или код..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <Select value={showResolved ? 'resolved' : 'unresolved'} onValueChange={(v) => setShowResolved(v === 'resolved')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Нерешённые</SelectItem>
                  <SelectItem value="resolved">Решённые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadViolations}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={violations.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Нарушения правил хуков ({filteredViolations.length})
          </CardTitle>
          <CardDescription>
            React Error #185 возникает при изменении количества хуков между рендерами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredViolations.map((violation) => (
                <Card key={violation.id} className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getTypeColor(violation.type)}>
                            {getTypeLabel(violation.type)}
                          </Badge>
                          <Badge variant="secondary">
                            <Code2 className="h-3 w-3 mr-1" />
                            {violation.hook}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(violation.timestamp), 'dd MMM yyyy HH:mm', { locale: ru })}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium font-mono text-muted-foreground">
                            {violation.file}:{violation.line}
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            <code>{violation.code}</code>
                          </pre>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded text-xs">
                          <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">⚠️ Проблема:</p>
                          <p className="text-muted-foreground">
                            Хук {violation.hook} вызывается {getTypeLabel(violation.type).toLowerCase()}, 
                            что может привести к React Error #185 при изменении количества элементов
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!violation.resolved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResolve(violation.id)}
                            title="Пометить как решённое"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(violation.id)}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredViolations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нарушений не найдено</p>
                  <p className="text-sm mt-2">
                    {violations.length === 0 
                      ? 'HookValidator не обнаружил ошибок в коде'
                      : 'Попробуйте изменить фильтры'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
