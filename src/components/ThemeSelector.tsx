import React from "react";
import { useTheme } from "@/context/ThemeContext";

const ThemeSelector = () => {
  const { theme, switchTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchTheme(e.target.value as any);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm font-semibold">Выберите тему:</label>
      <select
        value={theme}
        onChange={handleChange}
        className="p-2 border rounded bg-background text-foreground"
      >
        <option value="theme-shadow">Теневой маг</option>
        <option value="theme-fire">Огненный маг</option>
        <option value="theme-nature">Друид природы</option>
        <option value="theme-arcane">Волшебник</option>
        <option value="theme-warrior">Воин</option>
        <option value="theme-bard">Бард</option>
        <option value="theme-paladin">Паладин</option>
        <option value="theme-rogue">Вор</option>
      </select>
    </div>
  );
};

export default ThemeSelector;
