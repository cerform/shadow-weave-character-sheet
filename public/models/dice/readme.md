
# 3D модели кубиков для D&D

В этой директории могут находиться 3D модели кубиков для игры D&D в формате .glb, но они не обязательны для работы текущей версии приложения.

## Текущая реализация

Приложение использует специально разработанные геометрические формы для каждого типа кубиков:

- d4: Улучшенный тетраэдр с настроенной геометрией и уникальной текстурой
- d6: BoxGeometry с настраиваемыми размерами и улучшенным материалом
- d8: OctahedronGeometry с улучшенным внешним видом
- d10: Кастомная пентагональная трапецоэдра с улучшенной геометрией
- d12: DodecahedronGeometry с улучшенным внешним видом и материалами
- d20: IcosahedronGeometry с улучшенным внешним видом и увеличенной детализацией

Каждый тип кубика имеет свой уникальный цвет и анимацию, вдохновленную сервисом dice.bee.ac:

- d4: Светло-голубой (#B0E0E6)
- d6: Светло-зеленый (#98FB98)
- d8: Светло-оранжевый (#FFA07A)
- d10: Светло-фиолетовый (#DDA0DD)
- d12: Золотой (#FFD700)
- d20: Небесно-голубой (#87CEEB)

Броски кубиков теперь имеют более медленную и плавную анимацию с естественным замедлением для реалистичного эффекта. Длительность броска увеличена для лучшего визуального представления.

## Особенности текущей реализации

- Уникальная геометрия для каждого типа кубиков
- Индивидуальные цвета для разных кубиков, соответствующие стандартам D&D
- Плавная анимация броска с увеличенным временем замедления (3 секунды)
- Реалистичная физика движения и визуальные эффекты
- Отображение результата броска с учетом модификаторов
- Подсветка активных кубиков в интерфейсе
- Улучшенный интерфейс кнопок и контролов

## Возможные улучшения в будущем

- Добавление текстур для отображения чисел на гранях кубиков
- Реализация звуковых эффектов при бросках
- Поддержка специальных кубиков (например, процентные кубики d100)
- Интеграция пользовательских моделей кубиков через .glb файлы
- Физическая симуляция с отскоком от виртуальной поверхности

