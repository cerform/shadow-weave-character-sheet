
// Этот файл - заглушка для хелперов аутентификации
// В реальном приложении здесь будет настоящий код для работы с аутентификацией

// Получение текущего id пользователя
export function getCurrentUid(): string | null {
  // Пытаемся получить данные пользователя из localStorage (для простоты)
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user.uid || null;
    } catch (error) {
      console.error('Ошибка при разборе данных пользователя:', error);
      return null;
    }
  }
  
  // Возвращаем фиктивный id пользователя для тестирования
  return 'test-user-id';
}

// Проверка, авторизован ли пользователь
export function isAuthenticated(): boolean {
  return !!getCurrentUid();
}
