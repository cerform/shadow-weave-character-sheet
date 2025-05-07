
import { SpellData } from '@/types/spells';

export const level9: SpellData[] = [
  {
    id: "wish",
    name: "Исполнение желаний",
    name_en: "Wish",
    level: 9,
    school: "Вызов",
    castingTime: "1 действие",
    range: "На себя",
    components: "В",
    duration: "Мгновенная",
    description: "Исполнение желаний — это самое могущественное заклинание, доступное смертным. Произнеся заклинание, вы можете изменить саму реальность в соответствии с вашими желаниями. Простейшее использование — это дублирование любого заклинания волшебника или любого другого класса 8 уровня или ниже. Вы можете также создавать собственные эффекты, но это рискованно.",
    classes: ["Волшебник"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: false,
    material: false
  }
];
