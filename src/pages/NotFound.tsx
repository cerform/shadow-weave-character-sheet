
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Страница не найдена:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Страница не найдена</p>
        <Button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2"
        >
          <Home className="size-4" />
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
