
// Add or modify this file to include User type with role
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: 'player' | 'dm' | 'admin';
  // Include any other user properties
}

// Add necessary types for other files
export type UserType = User;
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  // Include other auth context properties
}
