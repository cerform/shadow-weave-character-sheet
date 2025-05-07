
import { SpellData } from '@/types/spells';

export const level4: SpellData[] = [
  {
    id: "polymorph",
    name: "Превращение",
    name_en: "Polymorph",
    level: 4,
    school: "Преобразование",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С, М (гусеница в коконе)",
    duration: "Концентрация, вплоть до 1 часа",
    description: "Заклинание превращает существо, которое вы видите в пределах дистанции, в новую форму. Несогласное существо должно пройти спасбросок Мудрости, чтобы избежать эффекта. Превращение продолжается до окончания заклинания или пока хиты цели не упадут до 0, или она не умрёт.",
    classes: ["Бард", "Волшебник", "Друид", "Чародей"],
    ritual: false,
    concentration: true,
    verbal: true,
    somatic: true,
    material: true
  }
];
