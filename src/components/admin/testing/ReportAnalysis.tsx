import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { TestReport, TestResult, TestSuite } from '@/types/testing';

interface ReportAnalysisProps {
  report: TestReport;
}

export const ReportAnalysis: React.FC<ReportAnalysisProps> = ({ report }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Информация об отчете</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Дата создания</p>
              <p className="font-medium">{new Date(report.timestamp).toLocaleString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего тест-сюитов</p>
              <p className="font-medium">{report.testSuites.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {report.testSuites.map((suite, suiteIdx) => (
        <Card key={suiteIdx}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{suite.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{suite.totalTests} тестов</Badge>
                {suite.failedTests > 0 && (
                  <Badge variant="destructive">{suite.failedTests} failed</Badge>
                )}
                {suite.warningTests > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {suite.warningTests} warnings
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {suite.tests.map((test, testIdx) => (
                  <div
                    key={testIdx}
                    className={`p-4 rounded-lg border transition-all ${
                      test.status === 'failed'
                        ? 'border-red-200 bg-red-50'
                        : test.status === 'warning'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <h4 className="font-medium">{test.name}</h4>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                    
                    {test.details && (
                      <div className="bg-background/50 p-2 rounded text-xs mt-2">
                        <p className="font-medium mb-1">Детали:</p>
                        <p className="text-muted-foreground">{test.details}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {test.duration !== undefined && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{test.duration}ms</span>
                        </div>
                      )}
                      <span>{new Date(test.timestamp).toLocaleTimeString('ru-RU')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
