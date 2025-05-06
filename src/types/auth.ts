
export interface UserType {
  uid?: string;
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
  lastLogin?: Date;
  createdAt?: Date;
}

export interface AuthContextType {
  currentUser: UserType | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserType>) => Promise<void>;
}
