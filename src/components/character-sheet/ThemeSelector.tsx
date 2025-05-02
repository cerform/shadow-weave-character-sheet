
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
  const { setUserTheme, activeTheme } = useUserTheme();
  
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
        <Button variant="ghost" size="icon" className="relative">
          <Paintbrush className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Изменить тему</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{
              backgroundColor: 
                activeTheme === 'amethyst' ? '#9b87f5' : 
                activeTheme === 'emerald' ? '#10B981' : 
                activeTheme === 'ruby' ? '#EA384D' : 
                activeTheme === 'sapphire' ? '#33C3F0' : 
                activeTheme === 'topaz' ? '#FCD34D' : 
                activeTheme === 'obsidian' ? '#222222' : '#8B5A2B'
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setUserTheme(theme.name)}
            className={activeTheme === theme.name ? "bg-primary/20" : ""}
          >
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{
                  backgroundColor: theme.name === 'amethyst' ? '#9b87f5' : 
                                  theme.name === 'emerald' ? '#10B981' : 
                                  theme.name === 'ruby' ? '#EA384D' : 
                                  theme.name === 'sapphire' ? '#33C3F0' : 
                                  theme.name === 'topaz' ? '#FCD34D' : 
                                  theme.name === 'obsidian' ? '#222222' : '#8B5A2B'
                }}
              />
              {theme.label} {activeTheme === theme.name && '✓'}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
