
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Paintbrush } from "lucide-react";
import { useUserTheme } from '@/contexts/UserThemeContext';

export const ThemeSelector = () => {
  const { setUserTheme } = useUserTheme();
  
  const themes = [
    { name: "amethyst", label: "Аметист" },
    { name: "emerald", label: "Изумруд" },
    { name: "ruby", label: "Рубин" },
    { name: "sapphire", label: "Сапфир" },
    { name: "topaz", label: "Топаз" },
    { name: "obsidian", label: "Обсидиан" },
    { name: "default", label: "По умолчанию" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Изменить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setUserTheme(theme.name)}
          >
            {theme.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
