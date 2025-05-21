
// Basic authentication helper functions

/**
 * Get the current user ID from localStorage or other auth storage
 */
export const getCurrentUid = (): string | null => {
  // Get from localStorage (in a real app, you might get this from Firebase Auth or similar)
  return localStorage.getItem('userId');
};

/**
 * Check if a user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getCurrentUid();
};

/**
 * Store the current user ID
 */
export const setCurrentUid = (uid: string): void => {
  localStorage.setItem('userId', uid);
};

/**
 * Clear the authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('userId');
};
