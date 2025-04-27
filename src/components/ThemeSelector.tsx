// src/components/ThemeSelector.tsx
import { useState, useEffect } from "react";

const themes = [
  { name: "Shadow Sorcerer", file: "shadow-sorcerer.css" },
  { name: "Fire Wizard", file: "fire-wizard.css" },
  { name: "Nature Druid", file: "nature-druid.css" },
  { name: "Water Cleric", file: "water-cleric.css" },
  { name: "Warrior", file: "warrior.css" },
];

const ThemeSelector = () => {
  const [theme, setTheme] = useState<string>(themes[0].file);

  useEffect(() => {
    const link = document.getElementById("theme-stylesheet") as HTMLLinkElement;

    if (link) {
      link.href = `/css/themes/${theme}`;
    } else {
      const newLink = document.createElement("link");
      newLink.id = "theme-stylesheet";
      newLink.rel = "stylesheet";
      newLink.href = `/css/themes/${theme}`;
      document.head.appendChild(newLink);
    }
  }, [theme]);

  return (
    <div className="flex justify-center mt-4">
      <select
        className="border p-2 rounded-md"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {themes.map((t) => (
          <option key={t.file} value={t.file}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
