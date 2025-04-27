import os

project_files = {
    # public
    "public/index.html": """<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Создай персонажа D&D 5e быстро и красиво" />
    <title>D&D 5e Character Creator</title>
    <link id="theme-stylesheet" rel="stylesheet" href="/css/themes/nature-druid.css" />
  </head>
  <body class="bg-background text-foreground min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""",
    "public/css/themes/shadow-sorcerer.css": """:root {
  --background: #1a001a;
  --foreground: #f3e8ff;
  --primary: #7f00ff;
  --primary-foreground: #ffffff;
  --secondary: #b266ff;
  --secondary-foreground: #1a001a;
  --accent: #5a00a0;
  --accent-foreground: #f3e8ff;
  --card: #2a0033;
  --card-foreground: #f3e8ff;
  --border: #7f00ff;
  --input: #7f00ff;
  --ring: #7f00ff;
}""",
    "public/css/themes/fire-wizard.css": """:root {
  --background: #330000;
  --foreground: #ffe6e6;
  --primary: #ff4400;
  --primary-foreground: #ffffff;
  --secondary: #ff7744;
  --secondary-foreground: #330000;
  --accent: #cc2900;
  --accent-foreground: #ffe6e6;
  --card: #661a1a;
  --card-foreground: #ffe6e6;
  --border: #ff4400;
  --input: #ff4400;
  --ring: #ff4400;
}""",
    "public/css/themes/nature-druid.css": """:root {
  --background: #002b00;
  --foreground: #e6ffe6;
  --primary: #00cc44;
  --primary-foreground: #ffffff;
  --secondary: #66ff66;
  --secondary-foreground: #002b00;
  --accent: #009933;
  --accent-foreground: #e6ffe6;
  --card: #194d19;
  --card-foreground: #e6ffe6;
  --border: #00cc44;
  --input: #00cc44;
  --ring: #00cc44;
}""",
    "public/css/themes/water-cleric.css": """:root {
  --background: #001a33;
  --foreground: #e6f7ff;
  --primary: #0099cc;
  --primary-foreground: #ffffff;
  --secondary: #66ccff;
  --secondary-foreground: #001a33;
  --accent: #0077b3;
  --accent-foreground: #e6f7ff;
  --card: #003366;
  --card-foreground: #e6f7ff;
  --border: #0099cc;
  --input: #0099cc;
  --ring: #0099cc;
}""",
    "public/css/themes/warrior.css": """:root {
  --background: #331a00;
  --foreground: #ffe6cc;
  --primary: #cc6600;
  --primary-foreground: #ffffff;
  --secondary: #ff9933;
  --secondary-foreground: #331a00;
  --accent: #b35900;
  --accent-foreground: #ffe6cc;
  --card: #663300;
  --card-foreground: #ffe6cc;
  --border: #cc6600;
  --input: #cc6600;
  --ring: #cc6600;
}""",
    # src files
    "src/main.tsx": """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
""",
    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;
""",
    "src/App.tsx": """import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CharacterProvider } from "@/context/CharacterContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import CharacterCreationPage from "@/pages/CharacterCreationPage";
import CharacterSheetPage from "@/pages/CharacterSheetPage";
import RaceSelection from "@/pages/create/RaceSelection";
import ClassSelection from "@/pages/create/ClassSelection";
import AttributeDistribution from "@/components/AttributeDistribution";
import SummaryPage from "@/pages/create/SummaryPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CharacterProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CharacterCreationPage />} />
              <Route path="/create/race" element={<RaceSelection />} />
              <Route path="/create/class" element={<ClassSelection />} />
              <Route path="/create/attributes" element={<AttributeDistribution />} />
              <Route path="/create/summary" element={<SummaryPage />} />
              <Route path="/sheet" element={<CharacterSheetPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </CharacterProvider>
    </QueryClientProvider>
  );
}

export default App;
""",
    "tailwind.config.ts": """import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
""",
    "vite.config.ts": """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
"""
}

# Create all files
for path, content in project_files.items():
    dir_path = os.path.dirname(path)
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Scaffold complete! The project structure has been created.")