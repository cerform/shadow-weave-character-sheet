import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface SafeDebugPanelProps {
  errors?: string[];
  warnings?: string[];
  debugInfo?: any;
  onRefresh?: () => void;
  onDiagnostics?: () => void;
}

const SafeDebugPanel: React.FC<SafeDebugPanelProps> = ({
  errors = [],
  warnings = [],
  debugInfo,
  onRefresh,
  onDiagnostics
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasIssues = errors.length > 0 || warnings.length > 0;
  
  // Если нет проблем и панель не открыта, не показываем её
  if (!hasIssues && !isOpen && !debugInfo) {
    return null;
  }

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="mb-4"
    >
      <CollapsibleTrigger asChild>
        <Card className={`cursor-pointer transition-colors ${hasIssues ? 'bg-amber-900/20 border-amber-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasIssues ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : (
                  <Info className="h-5 w-5 text-blue-400" />
                )}
                <h3 className="font-medium">
                  {hasIssues ? 'Обнаружены проблемы' : 'Диагностика системы'}
                </h3>
                {hasIssues && (
                  <Badge variant="destructive" className="bg-amber-600">
                    {errors.length + warnings.length}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-lg">Информация о системе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-400 mb-2">Ошибки:</h4>
                <ul className="space-y-1">
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm bg-red-900/20 p-2 rounded">
                      {error}
                    </li>
                  ))}
                </ul>
                {errors.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ...и ещё {errors.length - 5} ошибок
                  </p>
                )}
              </div>
            )}
            
            {warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-400 mb-2">Предупреждения:</h4>
                <ul className="space-y-1">
                  {warnings.slice(0, 3).map((warning, index) => (
                    <li key={index} className="text-sm bg-amber-900/20 p-2 rounded">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {debugInfo && (
              <div>
                <h4 className="font-medium mb-2">Отладочная информация:</h4>
                <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  Обновить
                </Button>
              )}
              {onDiagnostics && (
                <Button variant="outline" size="sm" onClick={onDiagnostics}>
                  Запустить диагностику
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SafeDebugPanel;