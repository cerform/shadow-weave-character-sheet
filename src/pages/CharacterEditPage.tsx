
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CharacterEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Редактирование персонажа</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">ID персонажа: {id}</p>
          <p className="mb-4 text-muted-foreground">Страница находится в разработке</p>
          <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterEditPage;
