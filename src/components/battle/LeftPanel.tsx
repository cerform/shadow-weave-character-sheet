import React from "react";

const LeftPanel = () => {
  return (
    <div className="bg-primary/5 border-r border-border p-4 flex flex-col gap-4">
      <h2 className="text-lg font-bold">Персонаж</h2>

      <div className="flex flex-col gap-2">
        <div>❤️ HP: 20 / 20</div>
        <div>🛡️ AC: 16</div>
        <div>⚡ Инициатива: +2</div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
          Бросить Кубик
        </button>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
          Атака
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;
