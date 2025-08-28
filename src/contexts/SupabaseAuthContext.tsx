import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Расширенный интерфейс пользователя с дополнительными свойствами
interface ExtendedUser extends User {
  displayName?: string;
  username?: string;
  photoURL?: string;
  isDM?: boolean;
  uid?: string;
  characterName?: string;
  characterClass?: string;
  characterRace?: string;
  characterLevel?: string;
  characterBio?: string;
  characterGuild?: string;
  role?: string;
  email: string; // Делаем email обязательным
}

interface AuthContextType {
  user: ExtendedUser | null;
  currentUser: ExtendedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

// Функция для преобразования Supabase User в ExtendedUser
const mapSupabaseUser = (user: User | null): ExtendedUser | null => {
  console.log('mapSupabaseUser вызвана с:', user);
  if (!user) {
    console.log('mapSupabaseUser: пользователь null, возвращаем null');
    return null;
  }
  
  const mappedUser = {
    ...user,
    email: user.email!, // Принудительно делаем email обязательным
    uid: user.id, // Маппим id в uid для совместимости
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    username: user.user_metadata?.username || user.email?.split('@')[0],
    photoURL: user.user_metadata?.avatar_url,
    isDM: user.user_metadata?.isDM || false,
    characterName: user.user_metadata?.characterName,
    characterClass: user.user_metadata?.characterClass,
    characterRace: user.user_metadata?.characterRace,
    characterLevel: user.user_metadata?.characterLevel,
    characterBio: user.user_metadata?.characterBio,
    characterGuild: user.user_metadata?.characterGuild,
    role: user.user_metadata?.role || 'player'
  };
  
  console.log('mapSupabaseUser: результат маппинга:', mappedUser);
  return mappedUser;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Fallback component that doesn't use hooks
function FallbackAuthProvider({ children }: AuthProviderProps) {
  const fallbackValue = {
    user: null,
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    googleLogin: async () => {},
    updateProfile: async () => {},
  };

  return (
    <AuthContext.Provider value={fallbackValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Check if React hooks are available
function isReactHooksAvailable() {
  try {
    // @ts-ignore - accessing internal React API
    return React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current !== null;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // If React hooks are not available, use fallback
  if (!isReactHooksAvailable()) {
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>;
  }

  let user: ExtendedUser | null;
  let setUser: (user: ExtendedUser | null) => void;
  let loading: boolean;
  let setLoading: (loading: boolean) => void;
  
  try {
    [user, setUser] = useState<ExtendedUser | null>(null);
    [loading, setLoading] = useState(true);
  } catch (error) {
    console.error('useState error in AuthProvider:', error);
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>;
  }

  useEffect(() => {
    let mounted = true;
    
    // Слушаем изменения аутентификации СНАЧАЛА
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('onAuthStateChange: событие:', event, 'сессия:', session);
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('onAuthStateChange: пользователь вышел или сессия отсутствует');
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          const mappedUser = mapSupabaseUser(session?.user ?? null);
          console.log('onAuthStateChange: установка пользователя:', mappedUser);
          setUser(mappedUser);
          setLoading(false);
        }
      }
    );

    // ЗАТЕМ получаем текущую сессию
    const getInitialSession = async () => {
      try {
        console.log('getInitialSession: получаем начальную сессию');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('getInitialSession: сессия:', session, 'ошибка:', error);
        
        if (mounted && !error && session) {
          const mappedUser = mapSupabaseUser(session.user);
          console.log('getInitialSession: установка пользователя:', mappedUser);
          setUser(mappedUser);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('getInitialSession error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    const { error } = await supabase.auth.updateUser({
      data,
    });
    
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    currentUser: user, // Для совместимости со старым кодом
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    googleLogin,
    updateProfile,
  };
  
  console.log('AuthProvider: текущее состояние:', {
    user: !!user,
    isAuthenticated: !!user,
    loading,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;