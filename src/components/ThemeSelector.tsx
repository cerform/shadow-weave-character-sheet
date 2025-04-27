import React, { useEffect } from "react";

const ThemeSelector = () => {
  const changeTheme = async (themeName: string) => {
    const response = await fetch(`/css/themes/${themeName}.css`);
    const cssText = await response.text();

    let styleTag = document.getElementById('theme-style') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-style';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssText;

    localStorage.setItem('selected-theme', themeName);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('selected-theme') || 'tavern-theme';
    changeTheme(savedTheme);
  }, []);

  const buttonBase = "relative px-6 py-3 text-lg font-bold text-white rounded-xl shadow-md bg-background ring-2 transition-all duration-300 hover:scale-105 hover:brightness-110";

  return (
    <div className="flex flex-wrap gap-4 mt-8 justify-center">
      {[
        { icon: "🍺", file: "tavern-theme" },
        { icon: "🌑", file: "shadow-sorcerer" },
        { icon: "🔥", file: "fire-wizard" },
        { icon: "🌿", file: "nature-druid" },
        { icon: "💧", file: "water-cleric" },
        { icon: "⚔️", file: "warrior" },
      ].map((theme) => (
        <button
          key={theme.file}
          onClick={() => changeTheme(theme.file)}
          className={`${buttonBase} ring-[hsl(var(--glow-color)/0.7)] hover:ring-[hsl(var(--glow-color)/1)]`}
        >
          {theme.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
