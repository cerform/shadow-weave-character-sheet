
export interface Step {
  id: string;
  title: string;
  description?: string;
  requiresSubraces?: boolean;
  requiresMagicClass?: boolean;
  completed?: boolean;
}

export interface UseCreationStepConfig {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  hasSubraces?: boolean;
  isMagicClass?: boolean;
}
