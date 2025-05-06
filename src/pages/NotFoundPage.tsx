
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Страница не найдена</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-lg mb-6">
            Запрашиваемая страница не существует
          </p>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
