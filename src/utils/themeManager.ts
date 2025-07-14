// themeManager.ts
export const applyTheme = (theme: string) => {
  document.documentElement.setAttribute("data-theme", theme);
  // Сохраняем выбранную тему в localStorage
  localStorage.setItem('selected-theme', theme);
};

export const getStoredTheme = (): string => {
  return localStorage.getItem('selected-theme') || 'default';
};

export const initializeTheme = () => {
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);
};