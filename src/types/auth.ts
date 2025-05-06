
export interface UserType {
  uid?: string;
  id?: string; // Добавляем id для совместимости
  email: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
  isDM?: boolean;
  characterName?: string;
  characterClass?: string;
  characterRace?: string;
  characterLevel?: string;
  characterBio?: string;
  characterGuild?: string;
  role?: string; // Добавляем свойство role
  lastLogin?: Date;
  createdAt?: Date;
}

// Type definition for User that includes role property
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  role?: 'user' | 'dm' | 'admin';
}

export interface AuthContextType {
  currentUser: UserType | null;
  user: UserType | null; // Добавляем user как алиас для currentUser
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  googleLogin: () => Promise<UserType | null>; // Добавляем googleLogin
  register: (email: string, password: string, displayName?: string, isDM?: boolean) => Promise<void>;
  signup: (email: string, password: string, displayName?: string, isDM?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserType>) => Promise<void>;
}
