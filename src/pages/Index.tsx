
import { useNavigate } from "react-router-dom";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement character loading logic
      console.log("Loading character from file:", file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container px-4 py-8 mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Dungeons & Dragons 5e</h1>
          <h2 className="text-2xl text-muted-foreground">Создай своего героя</h2>
        </header>

        <main>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Создать персонажа</h3>
              <p className="text-muted-foreground mb-4">
                Создайте нового персонажа по правилам книги игрока D&D 5e
              </p>
              <Button onClick={() => navigate("/create")} className="w-full gap-2">
                <Plus className="size-4" />
                Начать создание
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Загрузить персонажа</h3>
              <p className="text-muted-foreground mb-4">
                Загрузить ранее сохраненного персонажа
              </p>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => document.getElementById("character-file")?.click()}
              >
                <FileUp className="size-4" />
                Выбрать файл
              </Button>
              <input
                type="file"
                id="character-file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Card>
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
