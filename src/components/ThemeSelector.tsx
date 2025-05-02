
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/lib/themes";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as any);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm font-semibold text-foreground">Выберите тему:</label>
      <select
        value={theme}
        onChange={handleChange}
        className="p-2 border rounded bg-background text-foreground"
      >
        {Object.entries(themes).map(([key, value]) => (
          <option key={key} value={key}>{value.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
