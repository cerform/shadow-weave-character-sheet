
import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

// Определяем все возможные темы для соответствия типу Theme
type ThemeType = "light" | "dark" | "system" | "warlock" | "druid" | "bard" | string;

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light" as ThemeType)}>
          Светлая
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark" as ThemeType)}>
          Темная
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system" as ThemeType)}>
          Системная
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("warlock" as ThemeType)}>
          Чернокнижник
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("druid" as ThemeType)}>
          Друид
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("bard" as ThemeType)}>
          Бард
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
