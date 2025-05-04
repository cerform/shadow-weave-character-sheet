
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <Button 
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      asChild
    >
      <Link to="/">
        <Home className="size-4" />
        {showText && "На главную"}
      </Link>
    </Button>
  );
};

export default HomeButton;
