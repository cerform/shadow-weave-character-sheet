import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const infoMessageVariants = cva(
  "border",
  {
    variants: {
      variant: {
        default: "bg-background border-muted-foreground/20",
        info: "bg-blue-900/20 border-blue-500/50",
        success: "bg-green-900/20 border-green-500/50",
        warning: "bg-amber-900/20 border-amber-500/50",
        error: "bg-red-900/20 border-red-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface InfoMessageProps extends VariantProps<typeof infoMessageVariants> {
  title?: string;
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

const InfoMessage: React.FC<InfoMessageProps> = ({
  title,
  message,
  variant,
  className,
  icon,
}) => {
  // Выбираем иконку в зависимости от варианта
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} />;
    }
  };
  
  // Выбираем цвет заголовка в зависимости от варианта
  const getTitleClassName = () => {
    switch (variant) {
      case 'info':
        return "text-blue-200";
      case 'success':
        return "text-green-200";
      case 'warning':
        return "text-amber-200";
      case 'error':
        return "text-red-200";
      default:
        return "";
    }
  };

  return (
    <Alert className={cn(infoMessageVariants({ variant }), className)}>
      {getIcon()}
      {title && <AlertTitle className={getTitleClassName()}>{title}</AlertTitle>}
      <AlertDescription className="text-muted-foreground">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default InfoMessage;
