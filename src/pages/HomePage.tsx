
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Добро пожаловать в D&D Companion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Ваш верный помощник для игры в Dungeons & Dragons
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => navigate('/characters')}>
              <CardContent className="p-4 flex flex-col items-center">
                <h3 className="font-bold mb-2">Персонажи</h3>
                <p className="text-sm text-center">Управление вашими персонажами</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => navigate('/create-session')}>
              <CardContent className="p-4 flex flex-col items-center">
                <h3 className="font-bold mb-2">Создать сессию</h3>
                <p className="text-sm text-center">Соберите друзей для игры</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => navigate('/join')}>
              <CardContent className="p-4 flex flex-col items-center">
                <h3 className="font-bold mb-2">Присоединиться к игре</h3>
                <p className="text-sm text-center">Подключитесь к существующей сессии</p>
              </CardContent>
            </Card>

            {!user && (
              <Card className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => navigate('/auth')}>
                <CardContent className="p-4 flex flex-col items-center">
                  <h3 className="font-bold mb-2">Войти</h3>
                  <p className="text-sm text-center">Авторизуйтесь в системе</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
