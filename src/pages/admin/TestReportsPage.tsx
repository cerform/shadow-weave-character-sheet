import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3
} from 'lucide-react';
import { TestReport, TestResult } from '@/types/testing';
import { ReportAnalysis } from '@/components/admin/testing/ReportAnalysis';
import { ReportComparison } from '@/components/admin/testing/ReportComparison';
import { useToast } from '@/hooks/use-toast';

export default function TestReportsPage() {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const report: TestReport = JSON.parse(content);
        
        // Валидация структуры отчета
        if (!report.timestamp || !report.testSuites) {
          throw new Error('Некорректный формат отчета');
        }

        setReports(prev => [report, ...prev]);
        setSelectedReport(report);
        
        toast({
          title: 'Отчет загружен',
          description: `Загружен отчет от ${new Date(report.timestamp).toLocaleString('ru-RU')}`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить отчет. Проверьте формат файла.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const getOverallStats = (report: TestReport) => {
    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    };

    report.testSuites.forEach(suite => {
      stats.total += suite.totalTests;
      stats.passed += suite.passedTests;
      stats.failed += suite.failedTests;
      stats.warnings += suite.warningTests;
    });

    return stats;
  };

  const getCriticalIssues = (report: TestReport) => {
    const issues: TestResult[] = [];
    
    report.testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        if (test.status === 'failed') {
          issues.push(test);
        }
      });
    });

    return issues;
  };

  const getWarnings = (report: TestReport) => {
    const warnings: TestResult[] = [];
    
    report.testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        if (test.status === 'warning') {
          warnings.push(test);
        }
      });
    });

    return warnings;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Анализ тестовых отчетов</h1>
          <p className="text-muted-foreground mt-2">
            Загрузите и проанализируйте результаты автоматизированного тестирования
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <label className="cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Загрузить отчет
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет загруженных отчетов</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Загрузите JSON-отчет с результатами тестирования для анализа проблем и отслеживания прогресса
            </p>
            <Button asChild>
              <label className="cursor-pointer">
                Загрузить первый отчет
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="analysis">Детальный анализ</TabsTrigger>
            <TabsTrigger value="comparison">Сравнение отчетов</TabsTrigger>
            <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {selectedReport && (
              <>
                {/* Общая статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(() => {
                    const stats = getOverallStats(selectedReport);
                    const successRate = Math.round((stats.passed / stats.total) * 100);
                    
                    return (
                      <>
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Всего тестов</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Успешно
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
                            <p className="text-xs text-muted-foreground mt-1">{successRate}% успеха</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              Провалено
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                              Предупреждения
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.warnings}</div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>

                {/* Критические проблемы */}
                {(() => {
                  const criticalIssues = getCriticalIssues(selectedReport);
                  
                  return criticalIssues.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Обнаружены критические проблемы</AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="space-y-2">
                          {criticalIssues.map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{issue.name}</p>
                                <p className="text-sm opacity-90">{issue.message}</p>
                                {issue.details && (
                                  <p className="text-xs opacity-75 mt-1">{issue.details}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                })()}

                {/* Предупреждения */}
                {(() => {
                  const warnings = getWarnings(selectedReport);
                  
                  return warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Предупреждения требуют внимания</AlertTitle>
                      <AlertDescription className="mt-2">
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-3">
                            {warnings.map((warning, idx) => (
                              <div key={idx} className="flex items-start gap-2 pr-4">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                                <div className="flex-1">
                                  <p className="font-medium">{warning.name}</p>
                                  <p className="text-sm text-muted-foreground">{warning.message}</p>
                                  {warning.details && (
                                    <p className="text-xs text-muted-foreground mt-1">{warning.details}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  );
                })()}

                {/* Разбивка по категориям */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Результаты по категориям
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReport.testSuites.map((suite, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{suite.name}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {suite.passedTests} passed
                              </Badge>
                              {suite.failedTests > 0 && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  {suite.failedTests} failed
                                </Badge>
                              )}
                              {suite.warningTests > 0 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  {suite.warningTests} warnings
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(suite.passedTests / suite.totalTests) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {selectedReport && <ReportAnalysis report={selectedReport} />}
          </TabsContent>

          <TabsContent value="comparison">
            {reports.length >= 2 ? (
              <ReportComparison reports={reports} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Недостаточно данных</AlertTitle>
                <AlertDescription>
                  Загрузите минимум 2 отчета для сравнения прогресса
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle>Рекомендации по улучшению</CardTitle>
                  <CardDescription>
                    Автоматические рекомендации на основе результатов тестирования
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {getCriticalIssues(selectedReport).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          Критические проблемы (требуют немедленного решения)
                        </h3>
                        <div className="space-y-4 pl-7">
                          {getCriticalIssues(selectedReport).map((issue, idx) => (
                            <div key={idx} className="border-l-2 border-red-500 pl-4">
                              <h4 className="font-medium">{issue.name}</h4>
                              <p className="text-sm text-muted-foreground">{issue.message}</p>
                              {issue.details && (
                                <p className="text-sm mt-2 bg-muted p-2 rounded">{issue.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {getWarnings(selectedReport).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          Предупреждения (рекомендуется исправить)
                        </h3>
                        <div className="space-y-4 pl-7">
                          {getWarnings(selectedReport).map((warning, idx) => (
                            <div key={idx} className="border-l-2 border-yellow-500 pl-4">
                              <h4 className="font-medium">{warning.name}</h4>
                              <p className="text-sm text-muted-foreground">{warning.message}</p>
                              {warning.details && (
                                <p className="text-sm mt-2 bg-muted p-2 rounded">{warning.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
