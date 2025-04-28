import React, { useContext } from "react";
import OBSLayout from "@/components/OBSLayout";
import { CharacterContext } from "@/contexts/CharacterContext";

const CharacterSheetPage = () => {
  const { character } = useContext(CharacterContext);

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold">Нет сохранённого персонажа.</h1>
      </div>
    );
  }

  // Метки для характеристик
  const abilityLabels: Record<keyof typeof character.abilities, string> = {
    STR: "Сила",
    DEX: "Ловкость",
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость",
    CHA: "Харизма",
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <OBSLayout>
      {/* Левый сайдбар: базовая информация */}
      <div className="obs-left p-4 bg-background text-foreground overflow-y-auto">
        <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
        <p className="mb-1"><strong>Раса:</strong> {character.race}</p>
        <p className="mb-1"><strong>Класс и уровень:</strong> {character.className} {character.level}</p>
        <p className="mb-1"><strong>Пол:</strong> {character.gender || '–'}</p>
        <p><strong>Мировоззрение:</strong> {character.alignment || '–'}</p>
      </div>

      {/* Центр: характеристики */}
      <div className="obs-center p-4 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Характеристики</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(character.abilities).map(([key, value]) => (
            <div key={key} className="border border-border rounded p-3 bg-panel">
              <div className="text-lg font-semibold">
                {abilityLabels[key as keyof typeof abilityLabels]}
              </div>
              <div className="text-2xl mt-1">
                {value} <span className="opacity-75">({getModifier(value)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Правый сайдбар: заклинания и слоты */}
      <div className="obs-right p-4 bg-background text-foreground overflow-y-auto">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Ячейки заклинаний</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(character.spellSlots).map(([lvl, slot]) => (
              <div key={lvl} className="border border-border rounded p-2 w-28 bg-panel">
                <div className="font-medium">Уровень {lvl}</div>
                <div className="text-sm opacity-75">{slot.used} / {slot.max}</div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Известные заклинания</h2>
          {character.spellsKnown.length ? (
            <ul className="list-disc ml-5 space-y-1">
              {character.spellsKnown.map((sp) => (
                <li key={sp.id}>
                  {sp.name} <span className="opacity-75">(ур. {sp.level})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic opacity-75">Нет известных заклинаний.</p>
          )}
        </section>
      </div>
    </OBSLayout>
  );
};

export default CharacterSheetPage;
