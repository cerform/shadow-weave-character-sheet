import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { SentryService } from '@/services/SentryService';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null); // КРИТИЧНО: храним сессию для токенов
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    console.log('🔍 AuthProvider mount. URL:', window.location.href);
    
    // 1. СНАЧАЛА подписываемся на события
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 onAuthStateChange event:', event, 'session:', !!session, 'user:', session?.user?.email);
        if (!mounted) return;
        
        setSession(session);
        const mappedUser = session?.user ? mapSupabaseUser(session.user) : null;
        setUser(mappedUser);

        if (mappedUser) {
          console.log(`✅ ${event}: User set`, mappedUser.email);
          SentryService.setUser({
            id: mappedUser.id,
            email: mappedUser.email,
            username: mappedUser.displayName,
          });
        } else {
          console.log(`👋 ${event}: User cleared`);
          SentryService.setUser(null);
        }
        
        // Stop loading on any successful session or after initial check
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );
    
    // 2. ЗАТЕМ проверяем существующую сессию (на всякий случай)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) console.error('❌ getSession error:', error);
      
      console.log('📦 getSession result:', !!session, session?.user?.email);
      if (session) {
        setSession(session);
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        setLoading(false);
      }
    });

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