
export interface Step {
  id: number; // Changed from string to number
  name: string;
  description: string;
  requiresSubraces?: boolean;
  requiresMagicClass?: boolean;
}
