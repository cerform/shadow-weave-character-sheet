
// Add or modify this file to include User type with role
export interface User {
  uid: string;
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: 'player' | 'dm' | 'admin';
  isDM?: boolean;
  username?: string;
  characterName?: string;
  // Include any other user properties
}

// Add necessary types for other files
export type UserType = User;
export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  error: Error | null | string;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName?: string, isDM?: boolean) => Promise<void>;
  signup: (email: string, password: string, displayName?: string, isDM?: boolean) => Promise<void>;
  googleLogin: (redirectToPath?: string) => Promise<UserType | null>;
  isAuthenticated: boolean;
  updateProfile?: (data: Partial<UserType>) => Promise<void>;
  // Include other auth context properties
}
