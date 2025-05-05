
export interface Step {
  id: string;
  name: string;
  description: string;
  requiresSubraces?: boolean;
  requiresMagicClass?: boolean;
}
