
import React from 'react';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SaveCharacterButtonProps {
  character: Character;
}

export const SaveCharacterButton: React.FC<SaveCharacterButtonProps> = ({ character }) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleSave = () => {
    try {
      // Получаем существующих персонажей из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Проверяем, существует ли уже персонаж с таким ID
      const existingIndex = characters.findIndex((c: Character) => c.id === character.id);
      
      if (existingIndex !== -1) {
        // Обновляем существующего персонажа
        characters[existingIndex] = character;
      } else {
        // Добавляем нового персонажа
        characters.push(character);
      }
      
      // Сохраняем обновленный список персонажей
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      
      // Сохраняем ID последнего выбранного персонажа
      localStorage.setItem('last-selected-character', character.id || '');
      
      toast({
        title: "Персонаж сохранен",
        description: `${character.name || 'Персонаж'} успешно сохранен`,
      });
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      toast({
        title: "Ошибка при сохранении",
        description: "Не удалось сохранить персонажа",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Сохранить персонажа</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
