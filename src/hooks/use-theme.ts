
import { useContext } from "react";
import { ThemeProviderContext } from "@/components/theme-provider";
import { ThemeType, ThemeContextType } from "@/types/theme";

// Re-export using 'export type' to fix isolatedModules error
export type { ThemeType };

// Export ThemeContext to fix import in use-user-theme.ts
export { ThemeProviderContext as ThemeContext };

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
}
