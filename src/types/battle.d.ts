
// Add these type definitions to the file

export interface Token {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  img: string;
  isSelected?: boolean;
  isPlayer?: boolean;
  currentHP?: number;
  maxHP?: number;
  initiative?: number;
  tokenType?: string;
  conditions?: string[];
}

export interface InitiativeItem {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}
