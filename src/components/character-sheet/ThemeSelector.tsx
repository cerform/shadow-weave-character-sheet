
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
    { name: "default", label: "По умолчанию" },
    { name: "warlock", label: "Чернокнижник" },
    { name: "wizard", label: "Волшебник" },
    { name: "druid", label: "Друид" },
    { name: "warrior", label: "Воин" },
    { name: "bard", label: "Бард" },
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
                activeTheme === 'warlock' ? '#8B5CF6' : 
                activeTheme === 'wizard' ? '#33C3F0' : 
                activeTheme === 'druid' ? '#10B981' : 
                activeTheme === 'warrior' ? '#EA384D' : 
                activeTheme === 'bard' ? '#FCD34D' : '#8B5A2B'
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
                  backgroundColor: 
                    theme.name === 'warlock' ? '#8B5CF6' : 
                    theme.name === 'wizard' ? '#33C3F0' : 
                    theme.name === 'druid' ? '#10B981' : 
                    theme.name === 'warrior' ? '#EA384D' : 
                    theme.name === 'bard' ? '#FCD34D' : '#8B5A2B'
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
