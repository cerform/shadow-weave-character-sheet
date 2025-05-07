
import { SpellData } from '@/types/spells';

export const level5: SpellData[] = [
  {
    id: "cone-of-cold",
    name: "Конус холода",
    name_en: "Cone of Cold",
    level: 5,
    school: "Воплощение",
    castingTime: "1 действие",
    range: "На себя (конус 60 футов)",
    components: "В, С, М (маленький стеклянный конус или кристалл)",
    duration: "Мгновенная",
    description: "Вырвавшийся из вашей руки холод создаёт конус. Все существа в 60-футовом конусе должны сделать спасбросок Телосложения. Существа получают урон холодом 8к8 при провале или половину при успехе.",
    classes: ["Волшебник", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: true,
    higherLevels: "Если вы накладываете это заклинание, используя ячейку 6 уровня или выше, урон увеличивается на 1к8 за каждый уровень ячейки выше пятого."
  }
];
