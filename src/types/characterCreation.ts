
export interface Step {
  id: number;
  name: string;
  description: string;
  requiresSubraces?: boolean;
  requiresMagicClass?: boolean;
}

export interface UseCreationStepConfig {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  isMagicClass?: boolean;
  hasSubraces?: boolean;
}
