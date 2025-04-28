import React from "react";

const RightPanel = () => {
  return (
    <div className="bg-primary/5 border-l border-border p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-bold">Карточка Персонажа</h2>

      <div className="flex flex-col gap-2">
        <div>🏹 Сила: 16 (+3)</div>
        <div>🧠 Интеллект: 14 (+2)</div>
        <div>🛡️ Телосложение: 15 (+2)</div>
        <div>🎯 Ловкость: 14 (+2)</div>
        <div>🧙‍♂️ Мудрость: 12 (+1)</div>
        <div>✨ Харизма: 13 (+1)</div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="font-semibold">Навыки</h3>
        <div>🔮 Магия: +5</div>
        <div>🔍 Восприятие: +4</div>
        <div>🎭 Обман: +3</div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="font-semibold">Заклинания</h3>
        <div>🔥 Огненный шар</div>
        <div>❄️ Луч холода</div>
        <div>⚡ Молния</div>
      </div>
    </div>
  );
};

export default RightPanel;
