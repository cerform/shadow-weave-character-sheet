
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface NoSubracesAlertProps {
  raceName: string;
}

const NoSubracesAlert: React.FC<NoSubracesAlertProps> = ({ raceName }) => {
  const { themeStyles } = useTheme();
  
  return (
    <Alert 
      variant="default" 
      className="bg-primary/10 border border-primary/30 animate-fade-in"
      style={{ borderColor: `${themeStyles?.accent}40` }}
    >
      <Info className="h-5 w-5" style={{ color: themeStyles?.accent }} />
      <AlertDescription>
        У расы {raceName} нет доступных подрас. Переход к следующему шагу...
      </AlertDescription>
    </Alert>
  );
};

export default NoSubracesAlert;
