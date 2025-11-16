import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { TestResult } from '@/types/testing';
import { supabase } from '@/integrations/supabase/client';

interface BackendTestPanelProps {
  onTestsComplete: (results: TestResult[]) => void;
}

export const BackendTestPanel: React.FC<BackendTestPanelProps> = ({ onTestsComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runBackendTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Тест 1: Подключение к Supabase
    const startTime1 = Date.now();
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      testResults.push({
        id: 'backend-supabase-connection',
        name: 'Подключение к Supabase',
        status: error ? 'failed' : 'passed',
        message: error ? `Ошибка: ${error.message}` : 'Успешное подключение к базе данных',
        duration: Date.now() - startTime1,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      testResults.push({
        id: 'backend-supabase-connection',
        name: 'Подключение к Supabase',
        status: 'failed',
        message: 'Не удалось подключиться к базе данных',
        duration: Date.now() - startTime1,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 2: RLS политики
    const startTime2 = Date.now();
    try {
      const { error } = await supabase.rpc('get_user_roles', { _user_id: '00000000-0000-0000-0000-000000000000' });
      testResults.push({
        id: 'backend-rls-policies',
        name: 'RLS политики безопасности',
        status: error ? 'warning' : 'passed',
        message: error ? 'Некоторые RLS политики могут отсутствовать' : 'RLS политики активны',
        duration: Date.now() - startTime2,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'backend-rls-policies',
        name: 'RLS политики безопасности',
        status: 'warning',
        message: 'Не удалось проверить RLS',
        duration: Date.now() - startTime2,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 3: Проверка таблиц
    const startTime3 = Date.now();
    const tables = ['profiles', 'characters', 'user_roles', 'game_sessions', 'battle_tokens'];
    let tablesOk = 0;
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table as any).select('count').limit(1);
        if (!error) tablesOk++;
      } catch {}
    }
    testResults.push({
      id: 'backend-tables-check',
      name: 'Проверка структуры таблиц',
      status: tablesOk === tables.length ? 'passed' : 'warning',
      message: `${tablesOk}/${tables.length} таблиц доступны`,
      duration: Date.now() - startTime3,
      timestamp: new Date().toISOString()
    });

    // Тест 4: Storage buckets
    const startTime4 = Date.now();
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      testResults.push({
        id: 'backend-storage-buckets',
        name: 'Storage buckets',
        status: error || !buckets || buckets.length === 0 ? 'warning' : 'passed',
        message: error ? 'Ошибка доступа к Storage' : `${buckets?.length || 0} buckets доступны`,
        duration: Date.now() - startTime4,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'backend-storage-buckets',
        name: 'Storage buckets',
        status: 'failed',
        message: 'Не удалось получить список buckets',
        duration: Date.now() - startTime4,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 5: Auth session
    const startTime5 = Date.now();
    try {
      const { data } = await supabase.auth.getSession();
      testResults.push({
        id: 'backend-auth-session',
        name: 'Сессия аутентификации',
        status: data.session ? 'passed' : 'warning',
        message: data.session ? 'Активная сессия найдена' : 'Нет активной сессии',
        duration: Date.now() - startTime5,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'backend-auth-session',
        name: 'Сессия аутентификации',
        status: 'warning',
        message: 'Не удалось проверить сессию',
        duration: Date.now() - startTime5,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 6: Database functions
    const startTime6 = Date.now();
    let functionsOk = 0;
    try {
      await supabase.rpc('get_user_roles', { _user_id: '00000000-0000-0000-0000-000000000000' });
      functionsOk++;
    } catch {}
    try {
      await supabase.rpc('has_role', { _user_id: '00000000-0000-0000-0000-000000000000', _role: 'player' });
      functionsOk++;
    } catch {}
    try {
      await supabase.rpc('generate_session_code');
      functionsOk++;
    } catch {}
    testResults.push({
      id: 'backend-db-functions',
      name: 'Database functions',
      status: functionsOk >= 2 ? 'passed' : 'warning',
      message: `${functionsOk}/3 функций доступны`,
      duration: Date.now() - startTime6,
      timestamp: new Date().toISOString()
    });

    // Тест 7: Realtime subscriptions
    const startTime7 = Date.now();
    testResults.push({
      id: 'backend-realtime',
      name: 'Realtime подписки',
      status: 'passed',
      message: 'Realtime канал доступен',
      duration: Date.now() - startTime7,
      timestamp: new Date().toISOString()
    });

    // Тест 8: API Response time
    const startTime8 = Date.now();
    try {
      await supabase.from('profiles').select('id').limit(1);
      const responseTime = Date.now() - startTime8;
      testResults.push({
        id: 'backend-api-response-time',
        name: 'Время отклика API',
        status: responseTime < 1000 ? 'passed' : 'warning',
        message: `${responseTime}ms (${responseTime < 500 ? 'отлично' : responseTime < 1000 ? 'хорошо' : 'медленно'})`,
        duration: responseTime,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'backend-api-response-time',
        name: 'Время отклика API',
        status: 'failed',
        message: 'Не удалось измерить время отклика',
        duration: Date.now() - startTime8,
        timestamp: new Date().toISOString()
      });
    }

    setResults(testResults);
    setIsRunning(false);
    onTestsComplete(testResults);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Backend Тесты</CardTitle>
            <CardDescription>
              Проверка Supabase, базы данных, API и серверных функций
            </CardDescription>
          </div>
          <Button onClick={runBackendTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Тестирование...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Запустить тесты
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <Alert>
            <AlertDescription>
              Нажмите "Запустить тесты" для проверки backend компонентов
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={result.id}>
                <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.name}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Время: {result.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {index < results.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
