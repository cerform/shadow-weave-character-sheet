
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUserTheme } from '@/hooks/use-user-theme';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "outline";
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  className = "", 
  showText = true,
  variant = "outline"
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeTheme } = useUserTheme();
  
  const handleNavigateHome = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Показываем уведомление о переходе
    toast({
      title: "Переход на главную",
      description: "Возвращаемся на главную страницу...",
    });
    
    // Используем setTimeout для обеспечения плавного перехода
    setTimeout(() => {
      navigate('/');
    }, 300);
  };
  
  return (
    <Button 
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleNavigateHome}
    >
      <Home className="size-4" />
      {showText && "На главную"}
    </Button>
  );
};

export default HomeButton;
