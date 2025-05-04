
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  
  // Максимально простая функция для навигации без дополнительной логики
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  return (
    <Button 
      variant={variant}
      onClick={handleHomeNavigation}
      className={`flex items-center gap-2 ${className}`}
    >
      <Home className="size-4" />
      {showText && "На главную"}
    </Button>
  );
};

export default HomeButton;
