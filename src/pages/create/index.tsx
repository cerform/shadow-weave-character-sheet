// pages/create/index.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreateCharacter = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Создание нового персонажа</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button onClick={() => navigate("/create/race")} className="w-full">
          Начать выбор расы
        </Button>
        <Button onClick={() => navigate("/")} variant="secondary" className="w-full">
          Назад на главную
        </Button>
      </div>
    </div>
  );
};

export default CreateCharacter;
