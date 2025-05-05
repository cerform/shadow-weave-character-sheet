
export interface UserType {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // Добавляем свойства, которые используются в приложении
  isDM?: boolean;
  username?: string;
}

export interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Добавляем недостающие методы
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  isAuthenticated: boolean;
  currentUser: UserType | null;
}
