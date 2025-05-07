
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Book, DiceD20, UserCircle2, Settings } from "lucide-react";

interface NavigationButtonsProps {
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const navigate = useNavigate();
  
  return (
    <div className={`flex ${className || ''}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9" 
        onClick={() => navigate("/")}
        title="Домой"
      >
        <Home size={18} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9"
        onClick={() => navigate("/characters")}
        title="Персонажи"
      >
        <UserCircle2 size={18} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9"
        onClick={() => navigate("/dice")}
        title="Кости"
      >
        <DiceD20 size={18} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9"
        onClick={() => navigate("/spellbook")}
        title="Книга заклинаний"
      >
        <Book size={18} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9"
        onClick={() => navigate("/settings")}
        title="Настройки"
      >
        <Settings size={18} />
      </Button>
    </div>
  );
};

export default NavigationButtons;
