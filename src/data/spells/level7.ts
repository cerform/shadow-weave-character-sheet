
import { SpellData } from '@/types/spells';

export const level7: SpellData[] = [
  {
    id: "finger-of-death",
    name: "Перст смерти",
    name_en: "Finger of Death",
    level: 7,
    school: "Некромантия",
    castingTime: "1 действие",
    range: "60 футов",
    components: "В, С",
    duration: "Мгновенная",
    description: "Вы отправляете негативную энергию через существо в пределах дистанции, вызывая мучительную боль. Цель должна пройти спасбросок Телосложения. В случае провала она получает урон некротической энергией 7к8 + 30, или вдвое меньше урона при успешном спасброске. Гуманоид, убитый этим заклинанием, восстаёт в начале вашего следующего хода как зомби.",
    classes: ["Волшебник", "Колдун", "Чародей"],
    ritual: false,
    concentration: false,
    verbal: true,
    somatic: true,
    material: false
  }
];
