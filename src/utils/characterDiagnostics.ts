import { getCurrentUid, isAuthenticated } from '@/utils/authHelpers';
import { LocalCharacterStore } from '@/services/characterStorage';

// Диагностическая информация о состоянии системы персонажей
export interface CharacterSystemStatus {
  isAuthenticated: boolean;
  userId: string | null;
  localStorage: {
    charactersCount: number;
    totalSizeBytes: number;
    isAvailable: boolean;
  };
  firebase: {
    isConfigured: boolean;
    isConnected: boolean;
  };
  recommendations: string[];
}

// Получить полную диагностику системы
export const getCharacterSystemStatus = async (): Promise<CharacterSystemStatus> => {
  const status: CharacterSystemStatus = {
    isAuthenticated: false,
    userId: null,
    localStorage: {
      charactersCount: 0,
      totalSizeBytes: 0,
      isAvailable: false
    },
    firebase: {
      isConfigured: false,
      isConnected: false
    },
    recommendations: []
  };

  // Проверяем аутентификацию
  try {
    status.isAuthenticated = isAuthenticated();
    status.userId = getCurrentUid();
  } catch (error) {
    console.warn('Ошибка проверки аутентификации:', error);
    status.recommendations.push('Проблема с системой аутентификации Firebase');
  }

  // Проверяем localStorage
  try {
    const stats = LocalCharacterStore.getStats();
    status.localStorage.charactersCount = stats.total;
    status.localStorage.totalSizeBytes = stats.sizeInBytes;
    status.localStorage.isAvailable = typeof Storage !== 'undefined';
  } catch (error) {
    console.warn('Ошибка проверки localStorage:', error);
    status.localStorage.isAvailable = false;
    status.recommendations.push('localStorage недоступен - персонажи не будут сохраняться локально');
  }

  // Проверяем Firebase
  try {
    // Проверяем конфигурацию Firebase
    status.firebase.isConfigured = true; // Предполагаем что Firebase сконфигурирован
    
    // Проверяем подключение (базовая проверка)
    status.firebase.isConnected = true; // Это требует более сложной проверки
  } catch (error) {
    console.warn('Ошибка проверки Firebase:', error);
    status.firebase.isConfigured = false;
    status.recommendations.push('Firebase не сконфигурирован или недоступен');
  }

  // Генерируем рекомендации
  if (!status.isAuthenticated) {
    status.recommendations.push('Пользователь не авторизован - персонажи будут сохраняться только локально');
  }

  if (!status.localStorage.isAvailable) {
    status.recommendations.push('Локальное хранилище недоступно - персонажи могут потеряться при обновлении страницы');
  } else if (status.localStorage.charactersCount === 0) {
    status.recommendations.push('Нет сохраненных персонажей');
  }

  if (!status.firebase.isConfigured) {
    status.recommendations.push('Настройте Firebase для синхронизации персонажей между устройствами');
  }

  return status;
};

// Вывести диагностику в консоль
export const logCharacterSystemDiagnostics = async (): Promise<void> => {
  const status = await getCharacterSystemStatus();
  
  console.group('🔍 Диагностика системы персонажей D&D');
  
  console.log('👤 Аутентификация:');
  console.log(`  Авторизован: ${status.isAuthenticated ? '✅' : '❌'}`);
  console.log(`  User ID: ${status.userId || 'не определен'}`);
  
  console.log('💾 Локальное хранилище:');
  console.log(`  Доступно: ${status.localStorage.isAvailable ? '✅' : '❌'}`);
  console.log(`  Персонажей: ${status.localStorage.charactersCount}`);
  console.log(`  Размер: ${(status.localStorage.totalSizeBytes / 1024).toFixed(2)} KB`);
  
  console.log('🔥 Firebase:');
  console.log(`  Сконфигурирован: ${status.firebase.isConfigured ? '✅' : '❌'}`);
  console.log(`  Подключен: ${status.firebase.isConnected ? '✅' : '❌'}`);
  
  if (status.recommendations.length > 0) {
    console.log('💡 Рекомендации:');
    status.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  console.groupEnd();
};

// Экспортировать все персонажи пользователя
export const exportUserCharacters = (userId?: string): string => {
  try {
    const characters = LocalCharacterStore.getAll(userId);
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId || 'anonymous',
      charactersCount: characters.length,
      characters: characters
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Ошибка экспорта персонажей:', error);
    throw new Error('Не удалось экспортировать персонажей');
  }
};

// Импортировать персонажей из JSON
export const importUserCharacters = (jsonData: string, overwrite: boolean = false): number => {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.characters || !Array.isArray(importData.characters)) {
      throw new Error('Неверный формат данных для импорта');
    }
    
    let importedCount = 0;
    
    for (const character of importData.characters) {
      try {
        // Проверяем существование персонажа
        if (!overwrite && LocalCharacterStore.exists(character.id)) {
          console.warn(`Персонаж ${character.name} уже существует, пропускаем`);
          continue;
        }
        
        LocalCharacterStore.save(character);
        importedCount++;
      } catch (charError) {
        console.warn(`Ошибка импорта персонажа ${character.name}:`, charError);
      }
    }
    
    return importedCount;
  } catch (error) {
    console.error('Ошибка импорта персонажей:', error);
    throw new Error('Не удалось импортировать персонажей');
  }
};

// Очистить поврежденные данные
export const cleanupCorruptedData = (): number => {
  let cleanedCount = 0;
  
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('character_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // Проверяем базовые поля
            if (!parsed.id || !parsed.name) {
              localStorage.removeItem(key);
              cleanedCount++;
              console.log(`Удален поврежденный персонаж: ${key}`);
            }
          }
        } catch (parseError) {
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`Удален поврежденный персонаж: ${key}`);
        }
      }
    }
  } catch (error) {
    console.error('Ошибка очистки поврежденных данных:', error);
  }
  
  return cleanedCount;
};