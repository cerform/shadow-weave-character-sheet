// Утилита для отладки localStorage

export const inspectLocalStorage = () => {
  const characters: any[] = [];
  const otherData: any[] = [];
  
  console.group('🔍 Анализ localStorage');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    try {
      const value = localStorage.getItem(key);
      const parsedValue = value ? JSON.parse(value) : null;
      
      if (key.startsWith('character_')) {
        characters.push({ key, data: parsedValue });
        console.log(`📊 Персонаж найден: ${key}`, {
          name: parsedValue?.name || 'Без имени',
          userId: parsedValue?.userId || 'Без userId',
          id: parsedValue?.id || 'Без id',
          class: parsedValue?.class || 'Без класса',
          level: parsedValue?.level || 'Без уровня'
        });
      } else if (key.includes('character') || key.includes('dnd')) {
        otherData.push({ key, data: parsedValue });
        console.log(`🗂️ Связанные данные: ${key}`, parsedValue);
      }
    } catch (error) {
      console.warn(`❌ Ошибка парсинга ${key}:`, error);
    }
  }
  
  console.log(`📈 Итого найдено персонажей: ${characters.length}`);
  console.log(`📈 Итого других данных: ${otherData.length}`);
  console.groupEnd();
  
  return { characters, otherData };
};

export const validateCharacterData = (character: any) => {
  const issues: string[] = [];
  
  if (!character.id) issues.push('Отсутствует ID');
  if (!character.name) issues.push('Отсутствует имя');
  if (!character.userId) issues.push('Отсутствует userId');
  if (!character.class && !character.className) issues.push('Отсутствует класс');
  if (!character.race) issues.push('Отсутствует раса');
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

export const debugCharacterLoading = async (userId: string) => {
  console.group('🔍 Отладка загрузки персонажей');
  
  const localStorageData = inspectLocalStorage();
  const userCharacters = localStorageData.characters.filter(
    char => char.data?.userId === userId
  );
  
  console.log(`👤 Персонажи для пользователя ${userId}:`, userCharacters.length);
  
  userCharacters.forEach((char, index) => {
    const validation = validateCharacterData(char.data);
    console.log(`${index + 1}. ${char.key}:`, validation);
  });
  
  console.groupEnd();
  
  return {
    totalCharacters: localStorageData.characters.length,
    userCharacters: userCharacters.length,
    validCharacters: userCharacters.filter(char => 
      validateCharacterData(char.data).isValid
    ).length
  };
};