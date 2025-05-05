
import { CharacterSpell } from '@/types/character';

// Заговоры (0-й уровень)
export const level0: CharacterSpell[] = [
  {
    id: 'cantrip-1',
    name: 'Волшебная рука',
    level: 0,
    school: 'Вызов',
    castingTime: '1 действие',
    range: '30 футов',
    components: 'В, С',
    duration: '1 минута',
    description: 'Призрачная парящая рука, которая может манипулировать объектами, открывать двери и т.д.',
    classes: ['Бард', 'Волшебник', 'Чародей', 'Колдун'],
    source: 'PHB'
  },
  // ... добавьте здесь больше заговоров
];
