
import { ClassData } from '@/types/classes';

/**
 * Данные для класса "Изобретатель" (Artificer)
 */
const artificerClassData: ClassData = {
  name: "Изобретатель",
  hitDice: 8,
  primaryAbility: ["intelligence"],
  savingThrows: ["constitution", "intelligence"],
  armorProficiencies: ["light", "medium", "shields"],
  weaponProficiencies: ["simple"],
  toolProficiencies: ["thieves' tools", "tinker's tools", "one other type of artisan's tools"],
  skillChoices: ["arcana", "history", "investigation", "medicine", "nature", "perception", "sleight of hand"],
  skillCount: 2,
  spellcasting: {
    ability: "intelligence",
    spellSlots: {
      1: [2, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      2: [0, 0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      3: [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3],
      5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2]
    }
  },
  features: [
    {
      name: "Магическое вдохновение",
      level: 1,
      description: "Вы можете использовать инструменты изобретателя для фокусировки магии."
    },
    {
      name: "Использование заклинаний",
      level: 1,
      description: "Вы изучаете множество заклинаний и умеете творить магию, часто вплетая её в свои инструменты."
    },
    {
      name: "Магические предметы",
      level: 2,
      description: "Вы можете создавать волшебные предметы, которыми могут пользоваться ваши союзники."
    },
    {
      name: "Специализация изобретателя",
      level: 3,
      description: "Вы выбираете специализацию: Алхимик, Артиллерист или Боевой кузнец."
    }
  ],
  subclasses: {
    "Алхимик": {
      name: "Алхимик",
      description: "Алхимики используют свои знания алхимических смесей для создания магических эликсиров с разными эффектами.",
      features: [
        {
          name: "Эликсир экспериментатора",
          level: 3,
          description: "Вы можете создавать экспериментальные эликсиры с различными эффектами."
        },
        {
          name: "Алхимическая мудрость",
          level: 5,
          description: "Вы получаете дополнительные заклинания, связанные с алхимией."
        }
      ]
    },
    "Артиллерист": {
      name: "Артиллерист",
      description: "Артиллеристы специализируются на создании магических пушек и других устройств для дальнего боя.",
      features: [
        {
          name: "Эльдрический пушка",
          level: 3,
          description: "Вы можете создать маленькую или крошечную магическую пушку, которая стреляет энергией."
        },
        {
          name: "Магия взрывов",
          level: 5,
          description: "Вы получаете дополнительные заклинания, связанные с разрушительной магией."
        }
      ]
    }
  }
};

export default artificerClassData;
