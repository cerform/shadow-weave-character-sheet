import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CharacterContext, Character } from "@/contexts/CharacterContext";

type Props = {
  character: {
    race: string;
    class: string;
    spells: string[];
    name: string;
    gender: string;
    alignment: string;
    stats: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    background: string;
  };
  prevStep: () => void;
};

export default function CharacterReview({ character, prevStep }: Props) {
  const navigate = useNavigate();
  const { setCharacter } = useContext(CharacterContext);

  const handleFinish = () => {
    const abilities = {
      STR: character.stats.strength,
      DEX: character.stats.dexterity,
      CON: character.stats.constitution,
      INT: character.stats.intelligence,
      WIS: character.stats.wisdom,
      CHA: character.stats.charisma,
    };
    const spellsKnown = character.spells.map((s, idx) => ({ id: String(idx), name: s, level: 0 }));
    const spellSlots: Record<number, { max: number; used: number }> = {};

    const charObj: Character = {
      name: character.name,
      race: character.race,
      className: character.class,
      level: 1,
      abilities,
      spellsKnown,
      spellSlots,
    };

    setCharacter(charObj);
    navigate("/sheet");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Проверка персонажа</h1>

      <section className="mb-4">
        <h2 className="font-semibold">Основное</h2>
        <p>Имя: {character.name}</p>
        <p>Раса: {character.race}</p>
        <p>Класс: {character.class}</p>
        <p>Пол: {character.gender}</p>
        <p>Мировоззрение: {character.alignment}</p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Способности</h2>
        <ul className="grid grid-cols-3 gap-2">
          {Object.entries(character.stats).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value} ({Math.floor((value - 10) / 2) >= 0 ? "+" : ""}{Math.floor((value - 10) / 2)})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Заклинания</h2>
        {character.spells.length > 0 ? (
          <ul className="list-disc ml-5">
            {character.spells.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        ) : (
          <p>Нет известных заклинаний</p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">Предыстория</h2>
        <p>{character.background || "–"}</p>
      </section>

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Назад
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Завершить и сохранить
        </button>
      </div>
    </div>
  );
}
