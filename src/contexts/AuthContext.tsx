import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/services/firebase';
import { isOfflineMode, setOfflineMode } from '@/utils/authHelpers';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDM?: boolean;
}

interface AuthContextProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  enableOfflineMode: () => {},
  disableOfflineMode: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle auth state changes
  useEffect(() => {
    // Check if in offline mode
    if (isOfflineMode()) {
      // Create a mock user for offline mode
      const offlineUser = {
        uid: 'offline-user',
        email: 'offline@example.com',
        displayName: localStorage.getItem('offline-username') || 'Offline User',
        photoURL: null,
        isDM: true
      };
      
      setCurrentUser(offlineUser);
      setIsLoading(false);
      return;
    }
    
    // Otherwise listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isDM: user.email?.includes('dm') || false
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      // Update profile
      await updateUserProfile({ displayName });
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
      // Clear local auth data
      localStorage.removeItem('currentUser');
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profile: Partial<User>) => {
    try {
      if (isOfflineMode()) {
        // Update offline user
        if (profile.displayName) {
          localStorage.setItem('offline-username', profile.displayName);
        }
        
        setCurrentUser(curr => curr ? { ...curr, ...profile } : null);
        return;
      }
      
      // Update auth user profile
      // This would typically use updateProfile from firebase auth
      // For now just update the local state
      setCurrentUser(curr => curr ? { ...curr, ...profile } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  // Enable offline mode
  const enableOfflineMode = () => {
    setOfflineMode(true);
    
    // Create an offline user
    const offlineUser = {
      uid: 'offline-user',
      email: 'offline@example.com',
      displayName: localStorage.getItem('offline-username') || 'Offline User',
      photoURL: null,
      isDM: true
    };
    
    setCurrentUser(offlineUser);
  };
  
  // Disable offline mode
  const disableOfflineMode = () => {
    setOfflineMode(false);
    setCurrentUser(null); // Reset user, will trigger auth check
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    enableOfflineMode,
    disableOfflineMode
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
