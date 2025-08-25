// Утилита для соответствия имен токенов и 3D моделей
export interface TokenModelMapping {
  [key: string]: string;
}

// Соответствие русских и английских названий токенов к типам 3D моделей
export const tokenNameToModelType: TokenModelMapping = {
  // Русские названия
  'гоблин': 'goblin',
  'орк': 'orc',
  'дракон': 'dragon',
  'скелет': 'skeleton',
  'волк': 'wolf',
  'голем': 'golem',
  'воин': 'fighter',
  'воитель': 'fighter',
  'боец': 'fighter',
  'маг': 'fighter', // Используем модель воина для мага
  'волшебник': 'fighter',
  'чародей': 'fighter',
  'жрец': 'fighter',
  'паладин': 'fighter',
  'варвар': 'fighter',
  'разбойник': 'fighter',
  'рейнджер': 'fighter',
  'бард': 'fighter',
  'друид': 'fighter',
  'колдун': 'fighter',
  'монах': 'fighter',
  'чернокнижник': 'fighter',
  'изобретатель': 'fighter',
  
  // Английские названия
  'goblin': 'goblin',
  'orc': 'orc',
  'dragon': 'dragon',
  'skeleton': 'skeleton',
  'wolf': 'wolf',
  'golem': 'golem',
  'fighter': 'fighter',
  'warrior': 'fighter',
  'wizard': 'fighter',
  'mage': 'fighter',
  'sorcerer': 'fighter',
  'cleric': 'fighter',
  'paladin': 'fighter',
  'barbarian': 'fighter',
  'rogue': 'fighter',
  'ranger': 'fighter',
  'bard': 'fighter',
  'druid': 'fighter',
  'warlock': 'fighter',
  'monk': 'fighter',
  'artificer': 'fighter',
  
  // Дополнительные монстры
  'кобольд': 'goblin',
  'хобгоблин': 'orc',
  'огр': 'orc',
  'тролль': 'troll',
  'зомби': 'zombie',
  'вампир': 'skeleton',
  'лич': 'lich',
  'медведь': 'bear',
  'тигр': 'wolf',
  'лев': 'wolf',
  'паук': 'spider',
  'каменный голем': 'golem',
  'железный голем': 'golem',
  'элементаль': 'elemental',
  'мудрец': 'wizard',
  'вор': 'rogue',
  
  // Английские монстры
  'kobold': 'goblin',
  'hobgoblin': 'orc',
  'ogre': 'orc',
  'troll': 'troll',
  'zombie': 'zombie',
  'vampire': 'skeleton',
  'lich': 'lich',
  'bear': 'bear',
  'tiger': 'wolf',
  'lion': 'wolf',
  'spider': 'spider',
  'stone golem': 'golem',
  'iron golem': 'golem',
  'elemental': 'elemental',
  'sage': 'wizard',
  'thief': 'rogue',
};

/**
 * Определяет тип 3D модели по имени токена
 */
export function getModelTypeFromTokenName(tokenName: string): string | undefined {
  if (!tokenName) return undefined;
  
  const normalizedName = tokenName.toLowerCase().trim();
  
  // Прямое соответствие
  if (tokenNameToModelType[normalizedName]) {
    return tokenNameToModelType[normalizedName];
  }
  
  // Поиск по частичному совпадению
  for (const [key, value] of Object.entries(tokenNameToModelType)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Если ничего не найдено, возвращаем fighter как базовую модель
  return 'fighter';
}

/**
 * Определяет тип 3D модели по типу токена и имени
 */
export function determineMonsterType(tokenName: string, tokenType?: string): string {
  const nameBasedType = getModelTypeFromTokenName(tokenName);
  
  if (nameBasedType) {
    return nameBasedType;
  }
  
  // Fallback по типу токена
  switch (tokenType) {
    case 'monster':
      return 'goblin'; // По умолчанию для монстров
    case 'player':
      return 'fighter'; // По умолчанию для игроков
    case 'npc':
      return 'fighter'; // По умолчанию для NPC
    default:
      return 'fighter';
  }
}

/**
 * Обновляет токен с правильным типом модели
 */
export function updateTokenWithModelType(token: any): any {
  const modelType = determineMonsterType(token.name, token.type);
  
  return {
    ...token,
    monsterType: modelType
  };
}