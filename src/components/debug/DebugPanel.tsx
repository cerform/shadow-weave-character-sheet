
import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import { Badge } from '@/components/ui/badge';

interface DebugPanelProps {
  title?: string;
  data: any;
  showByDefault?: boolean;
  variant?: 'default' | 'error' | 'warning' | 'info';
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  title = "Отладочная информация", 
  data,
  showByDefault = false,
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(showByDefault);
  const [copySuccess, setCopySuccess] = useState(false);

  // Определяем стили в зависимости от варианта
  const getStyles = () => {
    switch (variant) {
      case 'error':
        return {
          bg: 'bg-red-900/40',
          border: 'border-red-700',
          text: 'text-red-200',
          pre: 'bg-black/50 text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-900/40',
          border: 'border-amber-700',
          text: 'text-amber-200',
          pre: 'bg-black/50 text-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-900/40',
          border: 'border-blue-700',
          text: 'text-blue-200',
          pre: 'bg-black/50 text-blue-400'
        };
      default:
        return {
          bg: 'bg-gray-900/40',
          border: 'border-gray-700',
          text: 'text-muted-foreground',
          pre: 'bg-black/50 text-green-400'
        };
    }
  };

  const styles = getStyles();

  // Копирование в буфер обмена
  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    ).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-2">
      <Card className={`${styles.bg} border-${styles.border} p-2`}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`w-full flex justify-between items-center text-xs ${styles.text} hover:text-foreground`}
          >
            <div className="flex items-center gap-2">
              <Bug size={14} />
              <span>{title}</span>
              {variant !== 'default' && (
                <Badge variant={variant === 'error' ? 'destructive' : variant === 'warning' ? 'default' : 'secondary'} className="text-[10px] h-5">
                  {variant.toUpperCase()}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 py-3">
            <pre className={`text-xs whitespace-pre-wrap overflow-auto max-h-48 p-2 rounded ${styles.pre}`}>
              {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
            </pre>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={copyToClipboard}
              >
                {copySuccess ? 'Скопировано!' : 'Копировать'}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default DebugPanel;
