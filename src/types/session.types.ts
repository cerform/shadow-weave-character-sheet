// Add the Initiative and TokenData types if they don't exist
export interface Initiative {
  id: string;
  name: string;
  initiative: number;
  isActive: boolean;
  isPlayer?: boolean;
  tokenId?: string | number;
  // Add any other needed properties
}

export interface TokenData {
  id: string;
  x: number;
  y: number;
  image?: string;
  name?: string;
  size?: number;
  // Add any other needed properties
}

// ... keep existing code
