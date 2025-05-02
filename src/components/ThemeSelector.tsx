
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as any);
  };

  const getContrastTextColor = (bgColor: string) => {
    return themes[bgColor as keyof typeof themes]?.textColor || "#FFFFFF";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm font-semibold text-foreground">Выберите тему:</label>
      <select
        value={theme}
        onChange={handleChange}
        className="p-2 border rounded bg-background text-foreground"
        style={{ color: getContrastTextColor(theme) }}
      >
        {Object.entries(themes).map(([key, value]) => (
          <option key={key} value={key}>{value.name}</option>
        ))}
      </select>
      
      <div className="mt-2">
        <Badge className="bg-primary text-primary-foreground">
          {themes[theme].name}
        </Badge>
      </div>
    </div>
  );
};

export default ThemeSelector;
