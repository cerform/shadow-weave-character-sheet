
import React from 'react';
import { MoonIcon, SunIcon, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import NavigationButtons from "@/components/ui/NavigationButtons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IconOnlyNavigationProps {
  includeThemeSelector?: boolean;
}

const IconOnlyNavigation: React.FC<IconOnlyNavigationProps> = ({ includeThemeSelector = false }) => {
  const { theme, setTheme } = useTheme();
  
  // Create a toggleTheme function since it's not provided by the context
  const toggleTheme = () => {
    // Switch between dark and default themes
    const newTheme = theme === 'dark' ? 'default' : 'dark';
    setTheme(newTheme);
  };
  
  return (
    <div className="flex items-center gap-2">
      <NavigationButtons />
      
      {includeThemeSelector && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default IconOnlyNavigation;
