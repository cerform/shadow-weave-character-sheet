# Маппинг 3D моделей для монстров D&D 5e

## Принципы маппинга

Система автоматически связывает монстров из D&D 5e API с 3D моделями на основе:

1. **Точного названия** (приоритет 1)
2. **Типа существа** (приоритет 2) 
3. **Размера** (приоритет 3)
4. **Fallback модель** (по умолчанию)

## Структура маппинга

### Точный маппинг по названию

```typescript
const exactMatches = {
  "goblin": "goblin.glb",
  "orc": "orc.glb", 
  "dragon": "dragon.glb"
}
```

### Маппинг по типу существа

```typescript
const typeMatches = {
  "humanoid": "human.glb",
  "beast": "wolf.glb",
  "undead": "skeleton.glb",
  "fiend": "demon.glb",
  "fey": "sprite.glb",
  "elemental": "elemental.glb",
  "aberration": "tentacle_horror.glb",
  "celestial": "angel.glb",
  "construct": "golem.glb",
  "dragon": "dragon.glb",
  "giant": "giant.glb",
  "monstrosity": "chimera.glb",
  "ooze": "slime.glb",
  "plant": "treant.glb"
}
```

### Маппинг по размеру

- **Tiny/Small**: Уменьшенный масштаб (0.5x)
- **Medium**: Стандартный масштаб (1.0x)
- **Large**: Увеличенный масштаб (1.5x)
- **Huge**: Большой масштаб (2.0x)
- **Gargantuan**: Огромный масштаб (3.0x)

## Примеры маппинга

### Goblin
- **Источник**: D&D 5e API `/monsters/goblin`
- **Тип**: humanoid
- **Размер**: Small
- **Модель**: `goblin.glb` (точное совпадение)
- **Масштаб**: 0.8

### Red Dragon Wyrmling
- **Источник**: D&D 5e API `/monsters/red-dragon-wyrmling`  
- **Тип**: dragon
- **Размер**: Medium
- **Модель**: `dragon.glb` (по типу)
- **Масштаб**: 1.0

### Zombie
- **Источник**: D&D 5e API `/monsters/zombie`
- **Тип**: undead
- **Размер**: Medium  
- **Модель**: `skeleton.glb` (по типу undead)
- **Масштаб**: 1.0

## Fallback система

1. Если точное название не найдено → проверяется тип
2. Если тип не найден → используется размер для масштабирования
3. Если всё не найдено → используется `placeholder.glb`

## Добавление новых моделей

1. Поместите `.glb` файл в `/public/models/creatures/`
2. Обновите `ModelRegistry.ts`:

```typescript
// Для точного маппинга
exactMatches.set("new-monster", {
  modelUrl: "/models/creatures/new-monster.glb",
  scale: 1.0,
  yOffset: 0
});

// Для маппинга по типу
typeMatches.set("new-type", {
  modelUrl: "/models/creatures/default-type.glb", 
  scale: 1.0,
  yOffset: 0
});
```

## Производительность

- Модели кэшируются после первой загрузки
- Используется lazy loading
- Fallback модели предзагружаются
- Максимальный размер модели: 10MB