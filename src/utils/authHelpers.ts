
// Функция для получения текущего ID пользователя
export const getCurrentUid = (): string => {
  // В этой реализации мы будем использовать локально сохраненный ID или генерировать новый
  let uid = localStorage.getItem('current-user-id');
  
  // Если ID нет, создаем новый
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('current-user-id', uid);
  }
  
  return uid;
};
