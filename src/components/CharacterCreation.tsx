import React, { useState } from "react";

// Данные для классов и начальных инвентарей
const classes = {
  sorcerer: {
    name: "Колдун",
    primaryStat: "Charisma",
    startingEquipment: ["древний посох", "свитки магии", "поток маны"],
    spells: ["Mage Armor", "Fireball", "Counterspell"],
  },
  warrior: {
    name: "Воин",
    primaryStat: "Strength",
    startingEquipment: ["меч", "щит", "легкая броня"],
    spells: [],
  },
  cleric: {
    name: "Клирик",
    primaryStat: "Wisdom",
    startingEquipment: ["святая книга", "молотовый посох", "святой амулет"],
    spells: ["Healing Word", "Bless", "Cure Wounds"],
  },
  warlock: {
    name: "Чародей",
    primaryStat: "Charisma",
    startingEquipment: ["магический амулет", "свитки чародейства"],
    spells: ["Eldritch Blast", "Hex", "Armor of Agathys"],
  },
  barbarian: {
    name: "Барбар",
    primaryStat: "Strength",
    startingEquipment: ["топор", "щиты", "кольчужный доспех"],
    spells: [],
  },
};

const availableSpells = {
  sorcerer: {
    1: ["Mage Armor", "Magic Missile", "Shield"],
    2: ["Fireball", "Counterspell"],
    3: ["Greater Invisibility", "Chain Lightning"],
  },
  cleric: {
    1: ["Healing Word", "Bless", "Cure Wounds"],
    2: ["Spiritual Weapon", "Guiding Bolt"],
    3: ["Mass Healing Word", "Flame Strike"],
  },
  warlock: {
    1: ["Eldritch Blast", "Hex", "Armor of Agathys"],
    2: ["Misty Step", "Invisibility"],
    3: ["Counterspell", "Fly"],
  },
};

const CharacterCreation = () => {
  const [className, setClassName] = useState<string>("");
  const [level, setLevel] = useState<number>(1);
  const [stats, setStats] = useState<number[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);

  const handleClassChange = (selectedClass: string) => {
    setClassName(selectedClass);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(parseInt(e.target.value));
  };

  const rollStats = () => {
    const rollDice = () => {
      let rolls = [];
      for (let i = 0; i < 4; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
      }
      rolls.sort((a, b) => b - a);
      return rolls[0] + rolls[1] + rolls[2];
    };

    const rolledStats = [];
    for (let i = 0; i < 6; i++) {
      rolledStats.push(rollDice());
    }
    setStats(rolledStats);
  };

  const handleSelectSpell = (spell: string) => {
    setSelectedSpells((prevSpells) => [...prevSpells, spell]);
  };

  const saveCharacter = () => {
    const characterData = {
      className,
      stats,
      selectedSpells,
      inventory: classes[className].startingEquipment,
    };

    const characterList = JSON.parse(localStorage.getItem('characters') || "[]");
    characterList.push(characterData);
    localStorage.setItem('characters', JSON.stringify(characterList));

    alert("Персонаж успешно сохранён!");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Создание персонажа</h2>

      <div className="mb-4">
        <label htmlFor="class" className="block text-lg font-semibold">Выберите класс:</label>
        <select
          id="class"
          className="border p-2"
          onChange={(e) => handleClassChange(e.target.value)}
        >
          <option value="">Выберите класс</option>
          <option value="sorcerer">Колдун</option>
          <option value="warrior">Воин</option>
          <option value="cleric">Клирик</option>
          <option value="warlock">Чародей</option>
          <option value="barbarian">Барбар</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="level" className="block text-lg font-semibold">Выберите уровень:</label>
        <select
          id="level"
          className="border p-2"
          onChange={handleLevelChange}
        >
          <option value={1}>1 уровень</option>
          <option value={2}>2 уровень</option>
          <option value={3}>3 уровень</option>
        </select>
      </div>

      {className && (
        <div>
          <h3 className="text-xl mb-2">Класс: {classes[className].name}</h3>
          <p><strong>Основная характеристика:</strong> {classes[className].primaryStat}</p>

          <div className="my-4">
            <button
              onClick={rollStats}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Бросить кубики для характеристик
            </button>

            {stats.length > 0 && (
              <div className="mt-4">
                <h4>Распределённые характеристики:</h4>
                <ul>
                  {stats.map((stat, index) => (
                    <li key={index}>{stat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="my-4">
            <h4>Начальный инвентарь:</h4>
            <ul>
              {classes[className].startingEquipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="my-4">
            <h4>Выберите заклинания:</h4>
            <ul>
              {availableSpells[className]?.[level]?.map((spell, index) => (
                <li key={index}>
                  <button onClick={() => handleSelectSpell(spell)} className="text-blue-500">
                    {spell}
                  </button>
                </li>
              ))}
            </ul>

            <div>
              <h5>Выбранные заклинания:</h5>
              <ul>
                {selectedSpells.map((spell, index) => (
                  <li key={index}>{spell}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={saveCharacter}
            className="px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            Завершить создание
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterCreation;
