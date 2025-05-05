
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface NoSubracesAlertProps {
  raceName: string;
}

const NoSubracesAlert: React.FC<NoSubracesAlertProps> = ({ raceName }) => {
  return (
    <Alert variant="default" className="bg-primary/10 border-primary/30">
      <Info className="h-5 w-5" />
      <AlertDescription>
        У расы {raceName} нет доступных подрас. Переход к следующему шагу...
      </AlertDescription>
    </Alert>
  );
};

export default NoSubracesAlert;
