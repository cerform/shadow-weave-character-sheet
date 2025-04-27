// src/components/ThemeSelector.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

const themes = [
  { name: "Shadow Sorcerer", file: "shadow-sorcerer.css" },
  { name: "Fire Wizard", file: "fire-wizard.css" },
  { name: "Nature Druid", file: "nature-druid.css" },
  { name: "Water Cleric", file: "water-cleric.css" },
  { name: "Warrior", file: "warrior.css" },
];

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("nature-druid.css");

  const changeTheme = (themeFile: string) => {
    const themeLink = document.getElementById("theme-stylesheet") as HTMLLinkElement | null;
    if (themeLink) {
      themeLink.href = `/css/themes/${themeFile}`;
    }
    setSelectedTheme(themeFile);
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <h3 className="text-lg font-semibold text-muted-foreground">Выберите тему оформления:</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {themes.map((theme) => (
          <Button
            key={theme.name}
            variant={selectedTheme === theme.file ? "default" : "secondary"}
            onClick={() => changeTheme(theme.file)}
          >
            {theme.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
