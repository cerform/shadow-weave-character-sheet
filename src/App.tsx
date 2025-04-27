// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CharacterProvider } from "@/context/CharacterContext";

// Страницы
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import CharacterCreationPage from "@/pages/CharacterCreationPage";
import CharacterSheetPage from "@/pages/CharacterSheetPage";

// Создание персонажа
import RaceSelection from "@/pages/create/RaceSelection";
import ClassSelection from "@/pages/create/ClassSelection";
import AttributeDistribution from "@/components/AttributeDistribution";
import SummaryPage from "@/pages/create/SummaryPage";

const queryClient = new QueryClient();

const App = () => {
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
};

export default App;
