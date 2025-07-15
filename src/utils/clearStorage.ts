// Утилита для очистки локального хранилища

export const clearAllLocalStorage = () => {
  try {
    // Очищаем весь localStorage
    localStorage.clear();
    
    // Очищаем sessionStorage
    sessionStorage.clear();
    
    // Очищаем IndexedDB (если используется)
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
    
    console.log('✅ Локальное хранилище полностью очищено');
    
    // Перезагружаем страницу для полной очистки состояния
    window.location.reload();
  } catch (error) {
    console.error('❌ Ошибка при очистке локального хранилища:', error);
  }
};

export const clearCharacterCreationProgress = () => {
  try {
    localStorage.removeItem('character_creation_progress');
    console.log('✅ Прогресс создания персонажа очищен');
  } catch (error) {
    console.error('❌ Ошибка при очистке прогресса создания персонажа:', error);
  }
};

export const clearFirebaseCache = () => {
  try {
    // Очищаем кэш Firebase
    const firebaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('firebase:') || 
      key.startsWith('firebaseui::') ||
      key.includes('firebase')
    );
    
    firebaseKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ Кэш Firebase очищен');
  } catch (error) {
    console.error('❌ Ошибка при очистке кэша Firebase:', error);
  }
};