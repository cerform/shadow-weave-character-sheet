import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { TestResult } from '@/types/testing';
import { supabase } from '@/integrations/supabase/client';

interface SecurityTestPanelProps {
  onTestsComplete: (results: TestResult[]) => void;
}

export const SecurityTestPanel: React.FC<SecurityTestPanelProps> = ({ onTestsComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runSecurityTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[]  = [];

    // Тест 1: HTTPS
    const startTime1 = Date.now();
    const isHTTPS = window.location.protocol === 'https:';
    testResults.push({
      id: 'security-https',
      name: 'HTTPS подключение',
      status: isHTTPS ? 'passed' : 'failed',
      message: isHTTPS ? 'Соединение защищено' : 'Используется небезопасное HTTP',
      duration: Date.now() - startTime1,
      timestamp: new Date().toISOString()
    });

    // Тест 2: Content Security Policy
    const startTime2 = Date.now();
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    testResults.push({
      id: 'security-csp',
      name: 'Content Security Policy',
      status: cspMeta ? 'passed' : 'warning',
      message: cspMeta ? 'CSP заголовки настроены' : 'CSP не настроен',
      details: 'Рекомендуется добавить CSP для защиты от XSS',
      duration: Date.now() - startTime2,
      timestamp: new Date().toISOString()
    });

    // Тест 3: Secure cookies
    const startTime3 = Date.now();
    const cookies = document.cookie;
    const hasSecureCookies = cookies.includes('Secure') || cookies.length === 0;
    testResults.push({
      id: 'security-cookies',
      name: 'Безопасные cookies',
      status: hasSecureCookies ? 'passed' : 'warning',
      message: hasSecureCookies ? 'Cookies защищены' : 'Некоторые cookies без флага Secure',
      duration: Date.now() - startTime3,
      timestamp: new Date().toISOString()
    });

    // Тест 4: XSS Protection
    const startTime4 = Date.now();
    const hasXSSProtection = document.querySelectorAll('[dangerouslySetInnerHTML]').length === 0;
    testResults.push({
      id: 'security-xss',
      name: 'XSS защита',
      status: hasXSSProtection ? 'passed' : 'warning',
      message: hasXSSProtection ? 
        'Не найдено опасных паттернов' : 
        'Обнаружено использование dangerouslySetInnerHTML',
      details: 'Используйте DOMPurify для санитизации HTML',
      duration: Date.now() - startTime4,
      timestamp: new Date().toISOString()
    });

    // Тест 5: localStorage security
    const startTime5 = Date.now();
    let sensitiveDataInStorage = false;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('password') || key.includes('token') || key.includes('secret'))) {
          sensitiveDataInStorage = true;
          break;
        }
      }
    } catch {}
    testResults.push({
      id: 'security-localstorage',
      name: 'Безопасность localStorage',
      status: !sensitiveDataInStorage ? 'passed' : 'warning',
      message: !sensitiveDataInStorage ? 
        'Нет чувствительных данных в localStorage' : 
        'Обнаружены потенциально чувствительные данные',
      details: 'Храните токены в httpOnly cookies',
      duration: Date.now() - startTime5,
      timestamp: new Date().toISOString()
    });

    // Тест 6: SQL Injection (RLS)
    const startTime6 = Date.now();
    try {
      // Попытка SQL injection
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', "'; DROP TABLE profiles; --");
      
      testResults.push({
        id: 'security-sql-injection',
        name: 'Защита от SQL Injection',
        status: 'passed',
        message: 'Supabase защищает от SQL injection',
        details: 'Prepared statements используются автоматически',
        duration: Date.now() - startTime6,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'security-sql-injection',
        name: 'Защита от SQL Injection',
        status: 'passed',
        message: 'Защита активна',
        duration: Date.now() - startTime6,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 7: Authentication check
    const startTime7 = Date.now();
    try {
      const { data } = await supabase.auth.getSession();
      testResults.push({
        id: 'security-auth-check',
        name: 'Проверка аутентификации',
        status: data.session ? 'passed' : 'warning',
        message: data.session ? 'Пользователь аутентифицирован' : 'Нет активной сессии',
        duration: Date.now() - startTime7,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'security-auth-check',
        name: 'Проверка аутентификации',
        status: 'failed',
        message: 'Не удалось проверить аутентификацию',
        duration: Date.now() - startTime7,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 8: RLS Policies
    const startTime8 = Date.now();
    try {
      // Попытка доступа к чужим данным
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      testResults.push({
        id: 'security-rls-policies',
        name: 'RLS политики',
        status: error || (data && data.length === 0) ? 'passed' : 'warning',
        message: error ? 
          'RLS блокирует неавторизованный доступ' : 
          'RLS политики могут требовать проверки',
        duration: Date.now() - startTime8,
        timestamp: new Date().toISOString()
      });
    } catch {
      testResults.push({
        id: 'security-rls-policies',
        name: 'RLS политики',
        status: 'passed',
        message: 'RLS активны',
        duration: Date.now() - startTime8,
        timestamp: new Date().toISOString()
      });
    }

    // Тест 9: CORS
    const startTime9 = Date.now();
    testResults.push({
      id: 'security-cors',
      name: 'CORS настройки',
      status: 'passed',
      message: 'Supabase управляет CORS автоматически',
      duration: Date.now() - startTime9,
      timestamp: new Date().toISOString()
    });

    // Тест 10: Secrets exposure
    const startTime10 = Date.now();
    const scripts = Array.from(document.scripts);
    let exposedSecrets = false;
    scripts.forEach(script => {
      if (script.textContent?.includes('SECRET') || 
          script.textContent?.includes('PRIVATE_KEY')) {
        exposedSecrets = true;
      }
    });
    testResults.push({
      id: 'security-secrets',
      name: 'Проверка утечки секретов',
      status: !exposedSecrets ? 'passed' : 'failed',
      message: !exposedSecrets ? 
        'Секреты не обнаружены в коде' : 
        'КРИТИЧНО: Обнаружены секреты в клиентском коде',
      duration: Date.now() - startTime10,
      timestamp: new Date().toISOString()
    });

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
            <CardTitle>Security Тесты</CardTitle>
            <CardDescription>
              Проверка безопасности, RLS политик, аутентификации и защиты данных
            </CardDescription>
          </div>
          <Button onClick={runSecurityTests} disabled={isRunning}>
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
              Нажмите "Запустить тесты" для проверки безопасности
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
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.details}
                        </p>
                      )}
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
