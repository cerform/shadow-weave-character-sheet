import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TestReport } from '@/types/testing';

interface ReportComparisonProps {
  reports: TestReport[];
}

export const ReportComparison: React.FC<ReportComparisonProps> = ({ reports }) => {
  const [baselineIdx, setBaselineIdx] = useState(1);
  const [compareIdx, setCompareIdx] = useState(0);

  const baseline = reports[baselineIdx];
  const compare = reports[compareIdx];

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

  const baselineStats = getOverallStats(baseline);
  const compareStats = getOverallStats(compare);

  const getDiff = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: diff,
      isPositive: diff > 0,
      isNegative: diff < 0,
      isNeutral: diff === 0,
    };
  };

  const passedDiff = getDiff(compareStats.passed, baselineStats.passed);
  const failedDiff = getDiff(compareStats.failed, baselineStats.failed);
  const warningsDiff = getDiff(compareStats.warnings, baselineStats.warnings);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выбор отчетов для сравнения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Базовый отчет (старый)</label>
              <Select value={baselineIdx.toString()} onValueChange={(v) => setBaselineIdx(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report, idx) => (
                    <SelectItem key={idx} value={idx.toString()} disabled={idx === compareIdx}>
                      {new Date(report.timestamp).toLocaleString('ru-RU')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Сравниваемый отчет (новый)</label>
              <Select value={compareIdx.toString()} onValueChange={(v) => setCompareIdx(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report, idx) => (
                    <SelectItem key={idx} value={idx.toString()} disabled={idx === baselineIdx}>
                      {new Date(report.timestamp).toLocaleString('ru-RU')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Пройденные тесты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{compareStats.passed}</span>
              <div className="flex items-center gap-1">
                {passedDiff.isPositive && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+{passedDiff.value}</span>
                  </>
                )}
                {passedDiff.isNegative && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{passedDiff.value}</span>
                  </>
                )}
                {passedDiff.isNeutral && (
                  <>
                    <Minus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">0</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Было: {baselineStats.passed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Проваленные тесты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">{compareStats.failed}</span>
              <div className="flex items-center gap-1">
                {failedDiff.isPositive && (
                  <>
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">+{failedDiff.value}</span>
                  </>
                )}
                {failedDiff.isNegative && (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{failedDiff.value}</span>
                  </>
                )}
                {failedDiff.isNeutral && (
                  <>
                    <Minus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">0</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Было: {baselineStats.failed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Предупреждения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-yellow-600">{compareStats.warnings}</span>
              <div className="flex items-center gap-1">
                {warningsDiff.isPositive && (
                  <>
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">+{warningsDiff.value}</span>
                  </>
                )}
                {warningsDiff.isNegative && (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{warningsDiff.value}</span>
                  </>
                )}
                {warningsDiff.isNeutral && (
                  <>
                    <Minus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">0</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Было: {baselineStats.warnings}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Изменения по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {compare.testSuites.map((suite, idx) => {
              const baselineSuite = baseline.testSuites.find(s => s.name === suite.name);
              if (!baselineSuite) return null;

              const passedChange = suite.passedTests - baselineSuite.passedTests;
              const failedChange = suite.failedTests - baselineSuite.failedTests;
              const warningsChange = suite.warningTests - baselineSuite.warningTests;

              return (
                <div key={idx} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{suite.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Пройдено</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{suite.passedTests}</span>
                        {passedChange !== 0 && (
                          <Badge 
                            variant="outline" 
                            className={passedChange > 0 ? 'text-green-600' : 'text-red-600'}
                          >
                            {passedChange > 0 ? '+' : ''}{passedChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Провалено</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{suite.failedTests}</span>
                        {failedChange !== 0 && (
                          <Badge 
                            variant="outline" 
                            className={failedChange > 0 ? 'text-red-600' : 'text-green-600'}
                          >
                            {failedChange > 0 ? '+' : ''}{failedChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Предупреждения</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{suite.warningTests}</span>
                        {warningsChange !== 0 && (
                          <Badge 
                            variant="outline" 
                            className={warningsChange > 0 ? 'text-yellow-600' : 'text-green-600'}
                          >
                            {warningsChange > 0 ? '+' : ''}{warningsChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
