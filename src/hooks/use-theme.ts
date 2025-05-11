
import { useContext } from "react";
import { ThemeProviderContext } from "@/components/theme-provider";
import { ThemeType, ThemeContextType } from "@/types/theme";

export { ThemeType };

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
}
