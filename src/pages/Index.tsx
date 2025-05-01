
import React from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Plus, Users, Book, BookOpen, User, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSelector from "@/components/character-sheet/ThemeSelector";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement character loading logic
      console.log("Loading character from file:", file.name);
    }
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      // TODO: Implement PDF character import
      console.log("Loading character from PDF:", file.name);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Dungeons & Dragons 5e</h1>
          <h2 className="text-2xl text-muted-foreground mb-4">Создай своего героя</h2>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Игрок</h3>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Персонаж
                  </CardTitle>
                  <CardDescription>
                    Создайте или управляйте персонажами
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate("/create")} className="w-full gap-2">
                    <Plus className="size-4" />
                    Создать персонажа
                  </Button>
                  
                  <Button variant="outline" onClick={() => document.getElementById("character-file")?.click()} className="w-full gap-2">
                    <FileUp className="size-4" />
                    Загрузить персонажа (JSON)
                  </Button>
                  <input
                    type="file"
                    id="character-file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  
                  <Button variant="outline" onClick={() => document.getElementById("pdf-file")?.click()} className="w-full gap-2">
                    <FileUp className="size-4" />
                    Импорт из PDF
                  </Button>
                  <input
                    type="file"
                    id="pdf-file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="size-5" />
                    Играть
                  </CardTitle>
                  <CardDescription>
                    Присоединяйтесь к игровым сессиям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/join")} className="w-full">
                    Присоединиться к сессии
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="size-5" />
                    Руководство игрока
                  </CardTitle>
                  <CardDescription>
                    Полное руководство по игре D&D 5e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/handbook")} className="w-full">
                    Открыть руководство
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Мастер Подземелий</h3>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Управление сессиями
                  </CardTitle>
                  <CardDescription>
                    Создавайте и управляйте игровыми сессиями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/dm")} className="w-full">
                    Панель мастера
                  </Button>
                </CardContent>
              </Card>
              
              {/* Карточка "Справочник D&D 5e" удалена, так как руководство игрока уже содержит эту информацию */}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Недавние персонажи</h3>
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 text-center text-muted-foreground">
              У вас пока нет сохраненных персонажей
            </div>
          </div>
        </main>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>D&D 5e Character Sheet Creator © 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
