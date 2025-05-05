import { auth } from '@/services/firebase';

// Check if the app is in offline mode 
export const isOfflineMode = (): boolean => {
  // If there's a specific offline flag in localStorage, respect it
  const offlineFlag = localStorage.getItem('offline-mode');
  if (offlineFlag === 'true') {
    return true;
  }
  
  // Otherwise, check if the user is authenticated
  return !auth.currentUser;
};

// Set offline mode
export const setOfflineMode = (enabled: boolean): void => {
  localStorage.setItem('offline-mode', enabled ? 'true' : 'false');
};

// Check if user is DM
export const isUserDM = (): boolean => {
  // Check if current user is DM based on the active session
  const activeSessionData = localStorage.getItem('active-session');
  if (activeSessionData) {
    try {
      const { isDM } = JSON.parse(activeSessionData);
      if (isDM) return true;
    } catch (error) {
      console.error('Error parsing active session data:', error);
    }
  }
  
  // If we're in offline mode, the user can be a DM
  if (isOfflineMode()) {
    return true;
  }
  
  // Otherwise, check if the user has DM role in auth
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.email?.includes('dm') || false;
  }
  
  return false;
};

// Get current user ID (either from auth or generate one for offline)
export const getCurrentUserId = (): string => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  
  // For offline mode, use or create a persistent anonymous ID
  let offlineUserId = localStorage.getItem('offline-user-id');
  if (!offlineUserId) {
    offlineUserId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('offline-user-id', offlineUserId);
  }
  
  return offlineUserId;
};
