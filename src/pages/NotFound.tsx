
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Страница не найдена:",
      location.pathname
    );
  }, [location.pathname]);

  // Проверяем, если это попытка перейти на /sheet
  const isSheetPage = location.pathname === '/sheet';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Страница не найдена</p>
        <p className="text-muted-foreground mb-6">
          К сожалению, запрошенная страница ({location.pathname}) не существует.
          {isSheetPage && " Возможно, вы искали страницу персонажа."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2"
          >
            <Home className="size-4" />
            На главную
          </Button>

          {isSheetPage && (
            <Button 
              onClick={() => navigate("/characters")} 
              className="flex items-center gap-2" 
              variant="secondary"
            >
              <Users className="size-4" />
              Список персонажей
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
