
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/auth';

// Create Context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  currentUser: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  signup: async () => {},
  googleLogin: async () => null
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    try {
      // In a real app, you'd make an API call here
      const mockUser: User = { 
        uid: '123', 
        id: '123', 
        email: email, 
        isDM: email.includes('dm'),
        role: email.includes('dm') ? 'dm' : 'player' 
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return Promise.resolve();
    } catch (e) {
      const err = e as Error;
      setError(err.message || String(err));
      throw e;
    }
  };

  // Mock logout function
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      return Promise.resolve();
    } catch (e) {
      const err = e as Error;
      setError(err.message || String(err));
      throw e;
    }
  };

  // Mock register function
  const register = async (email: string, password: string, displayName?: string, isDM?: boolean) => {
    try {
      // In a real app, you'd make an API call here
      const mockUser: User = { 
        uid: '123', 
        id: '123', 
        email: email,
        displayName,
        isDM,
        role: isDM ? 'dm' : 'player'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return Promise.resolve();
    } catch (e) {
      const err = e as Error;
      setError(err.message || String(err));
      throw e;
    }
  };

  // Alias for register
  const signup = register;

  // Mock Google login
  const googleLogin = async (redirectToPath?: string): Promise<User | null> => {
    try {
      // In a real app, you'd implement real Google Auth
      const mockUser: User = { 
        uid: '789', 
        id: '789', 
        email: 'google@example.com',
        displayName: 'Google User',
        isDM: false,
        role: 'player'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return mockUser;
    } catch (e) {
      const err = e as Error;
      setError(err.message || String(err));
      return null;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        currentUser: user, 
        login, 
        logout, 
        register,
        signup,
        googleLogin,
        loading,
        error
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);
