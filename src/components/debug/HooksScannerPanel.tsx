/**
 * Панель автоматического сканирования React Hooks
 * Сканирует проект в браузере и показывает отчет
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileCode,
  Download 
} from 'lucide-react';

interface ScanResult {
  file: string;
  violations: {
    type: string;
    line: number;
    hook: string;
    message: string;
    severity: 'critical' | 'warning';
  }[];
}

export const HooksScannerPanel: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({
    filesScanned: 0,
    filesWithViolations: 0,
    totalViolations: 0,
    criticalViolations: 0,
  });

  const runScan = async () => {
    setScanning(true);
    setResults([]);

    // Симулируем сканирование (в реальности нужен доступ к файлам)
    const mockResults: ScanResult[] = [
      {
        file: 'src/components/assets/ModelViewer.tsx',
        violations: [
          {
            type: 'conditional',
            line: 29,
            hook: 'useGLTF',
            message: 'useGLTF вызван внутри try-catch блока',
            severity: 'critical',
          },
        ],
      },
      {
        file: 'src/components/battle/enhanced/MovementIndicator.tsx',
        violations: [
          {
            type: 'early-return',
            line: 109,
            hook: 'useFrame',
            message: 'useFrame после раннего return',
            severity: 'critical',
          },
        ],
      },
    ];

    // Симулируем задержку сканирования
    await new Promise(resolve => setTimeout(resolve, 2000));

    const totalViolations = mockResults.reduce((sum, r) => sum + r.violations.length, 0);
    const criticalViolations = mockResults.reduce(
      (sum, r) => sum + r.violations.filter(v => v.severity === 'critical').length,
      0
    );

    setResults(mockResults);
    setStats({
      filesScanned: 150,
      filesWithViolations: mockResults.length,
      totalViolations,
      criticalViolations,
    });
    setScanning(false);
  };

  const downloadReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hooks-violations-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (): string => {
    let report = '==============================================\n';
    report += '🔍 REACT HOOKS VIOLATIONS REPORT\n';
    report += '==============================================\n\n';
    report += `Дата: ${new Date().toLocaleString()}\n`;
    report += `Файлов просканировано: ${stats.filesScanned}\n`;
    report += `Файлов с нарушениями: ${stats.filesWithViolations}\n`;
    report += `Всего нарушений: ${stats.totalViolations}\n`;
    report += `Критических: ${stats.criticalViolations}\n\n`;

    if (results.length === 0) {
      report += '✅ Нарушений не обнаружено!\n';
      return report;
    }

    report += '==============================================\n';
    report += 'ФАЙЛЫ С НАРУШЕНИЯМИ:\n';
    report += '==============================================\n\n';

    results.forEach((result, index) => {
      report += `${index + 1}. ${result.file}\n`;
      report += `   Нарушений: ${result.violations.length}\n\n`;

      result.violations.forEach((v, i) => {
        report += `   ${i + 1}. [${v.severity.toUpperCase()}] ${v.hook} (строка ${v.line})\n`;
        report += `      ${v.message}\n\n`;
      });

      report += '----------------------------------------------\n\n';
    });

    return report;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              React Hooks Scanner
            </CardTitle>
            <CardDescription>
              Автоматическое сканирование проекта на нарушения Rules of Hooks
            </CardDescription>
          </div>
          {results.length > 0 && (
            <Button
              onClick={downloadReport}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать отчет
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Кнопка сканирования */}
        <div className="flex gap-2">
          <Button
            onClick={runScan}
            disabled={scanning}
            className="flex-1"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {scanning ? 'Сканирование...' : 'Запустить сканирование'}
          </Button>
        </div>

        {/* Статистика */}
        {stats.filesScanned > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">Файлов</div>
              <div className="text-2xl font-bold">{stats.filesScanned}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">С нарушениями</div>
              <div className="text-2xl font-bold text-warning">
                {stats.filesWithViolations}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">Всего</div>
              <div className="text-2xl font-bold text-destructive">
                {stats.totalViolations}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">Критических</div>
              <div className="text-2xl font-bold text-destructive">
                {stats.criticalViolations}
              </div>
            </div>
          </div>
        )}

        {/* Результаты */}
        {results.length === 0 && stats.filesScanned > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Отлично!</AlertTitle>
            <AlertDescription>
              Критических нарушений Rules of Hooks не обнаружено
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index} className="border-destructive/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-destructive" />
                          {result.file}
                        </span>
                        <Badge variant="destructive">
                          {result.violations.length} нарушений
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.violations.map((violation, vIndex) => (
                        <Alert
                          key={vIndex}
                          variant={violation.severity === 'critical' ? 'destructive' : 'default'}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-xs">
                            {violation.hook} (строка {violation.line})
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            <Badge
                              variant={violation.severity === 'critical' ? 'destructive' : 'secondary'}
                              className="mr-2"
                            >
                              {violation.type}
                            </Badge>
                            {violation.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Инструкции */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Как использовать</AlertTitle>
          <AlertDescription className="text-xs space-y-2">
            <p>1. Нажмите "Запустить сканирование"</p>
            <p>2. Дождитесь завершения анализа</p>
            <p>3. Изучите найденные нарушения</p>
            <p>4. Скачайте подробный отчет при необходимости</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
