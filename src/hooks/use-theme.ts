
import { useContext } from "react";
import { ThemeProviderContext } from "@/components/theme-provider";
import type { ThemeType } from "@/types/theme";

export type { ThemeType };

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return {
    theme: context.theme as ThemeType,
    setTheme: context.setTheme as (theme: ThemeType) => void,
    themeStyles: context.themeStyles,
    effectiveTheme: context.effectiveTheme
  };
};
