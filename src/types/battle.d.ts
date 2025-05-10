
// Add these type definitions to the file

export interface Token {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  img: string;
  isSelected?: boolean;
  isPlayer?: boolean;
  currentHP?: number;
  maxHP?: number;
  hp?: number;
  maxHp?: number;
  initiative?: number;
  tokenType?: string;
  type?: string;
  conditions?: string[];
  ac?: number;
  resources?: Record<string, any>;
  visible?: boolean;
  size?: number;
}

export interface InitiativeItem {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}
