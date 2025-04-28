
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from '@/hooks/use-theme';
import { Check } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'warrior', name: 'Воин', color: 'bg-gray-600' },
    { id: 'tavern-theme', name: 'Таверна', color: 'bg-amber-700' },
    { id: 'fire-wizard', name: 'Огненный маг', color: 'bg-red-600' },
    { id: 'water-cleric', name: 'Водный клирик', color: 'bg-blue-600' },
    { id: 'nature-druid', name: 'Друид природы', color: 'bg-green-700' },
    { id: 'shadow-sorcerer', name: 'Теневой чародей', color: 'bg-purple-900' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className={`w-4 h-4 rounded-full mr-2 ${
            theme === 'warrior' ? 'bg-gray-600' :
            theme === 'tavern-theme' ? 'bg-amber-700' :
            theme === 'fire-wizard' ? 'bg-red-600' :
            theme === 'water-cleric' ? 'bg-blue-600' :
            theme === 'nature-druid' ? 'bg-green-700' :
            theme === 'shadow-sorcerer' ? 'bg-purple-900' : ''
          }`}></div>
          Тема
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded-full ${themeOption.color}`}></div>
            <span>{themeOption.name}</span>
            {theme === themeOption.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
