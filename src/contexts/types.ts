
import type Character from '@/types/character';

// Define the Theme interface with all required properties
export interface Theme {
  name: string;
  accent: string;
  background: string;
  cardBackground: string;
  foreground: string;
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  primaryColor?: string; // Added for backward compatibility
  buttonText: string;    // Added buttonText property
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
}

// Re-export Character as type to avoid isolatedModules error
export type { Character };
