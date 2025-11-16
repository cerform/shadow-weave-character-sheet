import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useProtectedRoute } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  Shield, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Database,
  Globe,
  Zap,
  Eye,
  Code,
  Download,
  RefreshCw
} from 'lucide-react';
import { UITestPanel } from '@/components/admin/testing/UITestPanel';
import { BackendTestPanel } from '@/components/admin/testing/BackendTestPanel';
import { PerformanceTestPanel } from '@/components/admin/testing/PerformanceTestPanel';
import { SecurityTestPanel } from '@/components/admin/testing/SecurityTestPanel';
import { IntegrationTestPanel } from '@/components/admin/testing/IntegrationTestPanel';

export interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  details?: string;
  duration?: number;
  timestamp?: string;
}

export interface TestSuite {
  name: string;
  category: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
}

const AdminTestingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useProtectedRoute();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/unauthorized');
    }
  }, [isAdmin, loading, navigate]);

  const runAllTests = async () => {
    setIsRunningAll(true);
    setOverallProgress(0);
    
    toast({
      title: "Запуск тестов",
      description: "Выполняется полная проверка системы...",
    });

    // Симуляция прогресса
    const interval = setInterval(() => {
      setOverallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningAll(false);
          toast({
            title: "Тесты завершены",
            description: "Проверьте результаты в соответствующих вкладках",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      testSuites,
      summary: {
        total: testSuites.reduce((sum, suite) => sum + suite.totalTests, 0),
        passed: testSuites.reduce((sum, suite) => sum + suite.passedTests, 0),
        failed: testSuites.reduce((sum, suite) => sum + suite.failedTests, 0),
        warnings: testSuites.reduce((sum, suite) => sum + suite.warningTests, 0),
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Отчёт экспортирован",
      description: "Файл сохранён в Downloads",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const failedTests = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const warningTests = testSuites.reduce((sum, suite) => sum + suite.warningTests, 0);
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              Админ-панель
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Центр тестирования
            </h1>
            <Badge variant="destructive">Admin Only</Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={exportReport}
              disabled={totalTests === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт отчёта
            </Button>
            <Button 
              onClick={runAllTests}
              disabled={isRunningAll}
            >
              {isRunningAll ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Запустить все тесты
            </Button>
          </div>
        </div>

        {/* Прогресс */}
        {isRunningAll && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Выполнение тестов...</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <Progress value={overallProgress} className="h-2" />
                <p className="text-sm mt-2">{overallProgress}% завершено</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Сводка */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Всего тестов</CardDescription>
              <CardTitle className="text-3xl">{totalTests}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Различных проверок
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Пройдено</CardDescription>
              <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {passedTests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Успешных проверок
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Провалено</CardDescription>
              <CardTitle className="text-3xl text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {failedTests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Критических ошибок
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Предупреждения</CardDescription>
              <CardTitle className="text-3xl text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {warningTests}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Некритических проблем
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Общая статистика */}
        {totalTests > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Успешность: {successRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={successRate} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Вкладки тестов */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="ui" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              UI/UX
            </TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Backend
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <IntegrationTestPanel 
              onTestsComplete={(results) => {
                const suite: TestSuite = {
                  name: 'Integration Tests',
                  category: 'integration',
                  tests: results,
                  totalTests: results.length,
                  passedTests: results.filter(r => r.status === 'passed').length,
                  failedTests: results.filter(r => r.status === 'failed').length,
                  warningTests: results.filter(r => r.status === 'warning').length,
                };
                setTestSuites(prev => [...prev.filter(s => s.category !== 'integration'), suite]);
              }}
            />
          </TabsContent>

          <TabsContent value="ui" className="mt-6">
            <UITestPanel 
              onTestsComplete={(results) => {
                const suite: TestSuite = {
                  name: 'UI/UX Tests',
                  category: 'ui',
                  tests: results,
                  totalTests: results.length,
                  passedTests: results.filter(r => r.status === 'passed').length,
                  failedTests: results.filter(r => r.status === 'failed').length,
                  warningTests: results.filter(r => r.status === 'warning').length,
                };
                setTestSuites(prev => [...prev.filter(s => s.category !== 'ui'), suite]);
              }}
            />
          </TabsContent>

          <TabsContent value="backend" className="mt-6">
            <BackendTestPanel 
              onTestsComplete={(results) => {
                const suite: TestSuite = {
                  name: 'Backend Tests',
                  category: 'backend',
                  tests: results,
                  totalTests: results.length,
                  passedTests: results.filter(r => r.status === 'passed').length,
                  failedTests: results.filter(r => r.status === 'failed').length,
                  warningTests: results.filter(r => r.status === 'warning').length,
                };
                setTestSuites(prev => [...prev.filter(s => s.category !== 'backend'), suite]);
              }}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceTestPanel 
              onTestsComplete={(results) => {
                const suite: TestSuite = {
                  name: 'Performance Tests',
                  category: 'performance',
                  tests: results,
                  totalTests: results.length,
                  passedTests: results.filter(r => r.status === 'passed').length,
                  failedTests: results.filter(r => r.status === 'failed').length,
                  warningTests: results.filter(r => r.status === 'warning').length,
                };
                setTestSuites(prev => [...prev.filter(s => s.category !== 'performance'), suite]);
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTestPanel 
              onTestsComplete={(results) => {
                const suite: TestSuite = {
                  name: 'Security Tests',
                  category: 'security',
                  tests: results,
                  totalTests: results.length,
                  passedTests: results.filter(r => r.status === 'passed').length,
                  failedTests: results.filter(r => r.status === 'failed').length,
                  warningTests: results.filter(r => r.status === 'warning').length,
                };
                setTestSuites(prev => [...prev.filter(s => s.category !== 'security'), suite]);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminTestingPage;
