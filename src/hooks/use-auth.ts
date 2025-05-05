
// Экспорт useAuth из AuthContext для совместимости с существующим кодом
export { useAuth, AuthProvider } from '@/contexts/AuthContext';

// Экспортируем типы для удобства использования
export type { UserType, AuthContextType } from '@/types/auth';
