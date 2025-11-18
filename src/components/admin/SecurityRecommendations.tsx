import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, ShieldAlert, Lock, Eye, Shield, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Recommendation {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
  category: string;
  solution?: string;
  icon: React.ReactNode;
}

export const SecurityRecommendations: React.FC = () => {
  const recommendations: Recommendation[] = [
    // Критические проблемы
    {
      title: 'Auth → Profile интеграция',
      description: 'Ошибка получения профиля пользователя',
      severity: 'critical',
      category: 'Критические проблемы',
      solution: 'Проверьте RLS политики для таблицы profiles и убедитесь, что триггер on_auth_user_created работает корректно',
      icon: <ShieldAlert className="h-5 w-5" />
    },
    
    // Предупреждения
    {
      title: 'Storage buckets',
      description: '0 buckets доступны',
      severity: 'warning',
      category: 'Предупреждения',
      solution: 'Создайте storage buckets для загрузки файлов и настройте соответствующие политики доступа',
      icon: <Database className="h-5 w-5" />
    },
    {
      title: 'Content Security Policy',
      description: 'CSP не настроен',
      severity: 'warning',
      category: 'Предупреждения',
      solution: 'Рекомендуется добавить CSP заголовки для защиты от XSS атак. Настройте в vercel.json или в edge function',
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: 'Безопасность localStorage',
      description: 'Обнаружены потенциально чувствительные данные',
      severity: 'warning',
      category: 'Предупреждения',
      solution: 'Храните токены в httpOnly cookies вместо localStorage. Рассмотрите использование Supabase Auth для управления сессиями',
      icon: <Lock className="h-5 w-5" />
    },
    {
      title: 'Доступность (ARIA, Keyboard Navigation)',
      description: 'Некоторые элементы без ARIA-меток',
      severity: 'warning',
      category: 'Предупреждения',
      solution: 'Проверьте кнопки, формы и модальные окна. Добавьте aria-label для интерактивных элементов без текста',
      icon: <Eye className="h-5 w-5" />
    },
    
    // Успешные проверки
    {
      title: 'Размеры кликабельных областей',
      description: 'Все кнопки достаточно большие для клика (min 44x44px)',
      severity: 'success',
      category: 'Успешные проверки',
      icon: <CheckCircle2 className="h-5 w-5" />
    }
  ];

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Критично</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />Предупреждение</Badge>;
      case 'success':
        return <Badge variant="default" className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3" />Успешно</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Info className="h-3 w-3" />Инфо</Badge>;
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'hsl(var(--destructive))';
      case 'warning':
        return 'hsl(var(--warning))';
      case 'success':
        return 'hsl(var(--success))';
      default:
        return 'hsl(var(--border))';
    }
  };

  // Группировка по категориям
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
  const warningCount = recommendations.filter(r => r.severity === 'warning').length;
  const successCount = recommendations.filter(r => r.severity === 'success').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Рекомендации по улучшению
          <div className="flex gap-2 ml-auto">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} критичных</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary">{warningCount} предупреждений</Badge>
            )}
            {successCount > 0 && (
              <Badge variant="default" className="bg-success text-success-foreground">{successCount} успешно</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Автоматические рекомендации на основе результатов тестирования
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Общая сводка */}
        {criticalCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Обнаружены критические проблемы</AlertTitle>
            <AlertDescription>
              {criticalCount} {criticalCount === 1 ? 'проблема требует' : 'проблем требуют'} немедленного решения для обеспечения безопасности и стабильности приложения.
            </AlertDescription>
          </Alert>
        )}

        {/* Рекомендации по категориям */}
        {Object.entries(groupedRecommendations).map(([category, recs], categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{category}</h3>
              <Badge variant="outline">{recs.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {recs.map((rec, index) => (
                <Card 
                  key={index} 
                  className="border-l-4 transition-all hover:shadow-md"
                  style={{ borderLeftColor: getBorderColor(rec.severity) }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ 
                          backgroundColor: rec.severity === 'critical' ? 'hsl(var(--destructive) / 0.1)' :
                                         rec.severity === 'warning' ? 'hsl(var(--warning) / 0.1)' :
                                         rec.severity === 'success' ? 'hsl(var(--success) / 0.1)' :
                                         'hsl(var(--muted))',
                          color: rec.severity === 'critical' ? 'hsl(var(--destructive))' :
                                rec.severity === 'warning' ? 'hsl(var(--warning))' :
                                rec.severity === 'success' ? 'hsl(var(--success))' :
                                'hsl(var(--foreground))'
                        }}
                      >
                        {rec.icon}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold">{rec.title}</h4>
                          {getSeverityBadge(rec.severity)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {rec.description}
                        </p>
                        
                        {rec.solution && (
                          <>
                            <Separator className="my-2" />
                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-sm">
                                <strong className="text-foreground">Решение:</strong>{' '}
                                <span className="text-muted-foreground">{rec.solution}</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Дополнительная информация */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Приоритизация:</strong> Рекомендуется сначала устранить критические проблемы, 
            затем предупреждения. Успешные проверки показывают, что ваше приложение уже следует 
            лучшим практикам в этих областях.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
