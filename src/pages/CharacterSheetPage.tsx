import React from "react";

const CharacterSheetPage = () => {
  const character = JSON.parse(localStorage.getItem("character") || "{}");

  if (!character || !character.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Нет сохранённого персонажа.</h1>
      </div>
    );
  }

  const abilityNames: Record<string, string> = {
    strength: "Сила",
    dexterity: "Ловкость",
    constitution: "Телосложение",
    intelligence: "Интеллект",
    wisdom: "Мудрость",
    charisma: "Харизма",
  };

  const calcModifier = (value: number) => {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="min-h-screen grid grid-cols-12 gap-4 p-4 bg-background text-foreground transition-all duration-500">

      {/* Левая панель */}
      <div className="col-span-2 flex flex-col gap-4 bg-primary/5 border border-border rounded-2xl p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Игрок</h2>
        <div className="text-lg font-semibold">{character.name}</div>
        <div className="text-sm opacity-80">Класс: {character.class || "—"}</div>
        <div className="text-sm opacity-80">Раса: {character.race || "—"}</div>
        <div className="text-sm opacity-80">Пол: {character.gender}</div>
        <div className="text-sm opacity-80">Мировоззрение: {character.alignment}</div>
        <div className="text-sm opacity-80">Предыстория: {character.background}</div>
      </div>

      {/* Центральная сцена */}
      <div className="col-span-8 bg-primary/5 border border-border rounded-2xl p-4 shadow-xl flex items-center justify-center">
        <div className="text-2xl font-bold opacity-30">
          Центральная сцена — Здесь будет бой / карта / токены
        </div>
      </div>

      {/* Правая панель */}
      <div className="col-span-2 flex flex-col gap-4 bg-primary/5 border border-border rounded-2xl p-4 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Характеристики</h2>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(character.stats || {}).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center justify-center bg-background/50 border rounded-lg p-2">
              <div className="text-sm font-semibold">{abilityNames[key]}</div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs opacity-70">{calcModifier(value)}</div>
            </div>
          ))}
        </div>

        {/* Здесь будут заклинания и умения */}
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Заклинания / Способности</h3>
          <div className="text-sm opacity-70 italic">
            (В будущем здесь будут заклинания и умения персонажа)
          </div>
        </div>
      </div>

    </div>
  );
};

export default CharacterSheetPage;
