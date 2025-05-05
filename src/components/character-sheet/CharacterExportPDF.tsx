
import React from 'react';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterExportPDFProps {
  character: Character;
}

export const CharacterExportPDF: React.FC<CharacterExportPDFProps> = ({ character }) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleExport = () => {
    toast({
      title: "Функция в разработке",
      description: "Экспорт в PDF будет доступен в следующих обновлениях",
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Экспорт в PDF</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
