
export interface UserType {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isDM?: boolean;
  username?: string;
  uid?: string;
}

export interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName?: string, isDM?: boolean) => Promise<void>;
  googleLogin: () => Promise<UserType | null>; // Изменили тип возвращаемого значения на UserType | null
  isAuthenticated: boolean;
  currentUser: UserType | null;
  updateProfile?: (data: Partial<UserType>) => Promise<void>;
  signup?: (email: string, password: string, displayName: string, isDM?: boolean) => Promise<void>;
}
