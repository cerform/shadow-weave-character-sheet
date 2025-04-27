import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} variant="outline" className="mt-4">
      {theme === "light" ? "Тёмная тема 🌙" : "Светлая тема ☀️"}
    </Button>
  );
};

export default ThemeToggle;
