
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// This is a temporary placeholder for the PlayBattlePage
// It will be replaced with the full implementation later
const PlayBattlePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2 text-destructive" />
            Страница в разработке
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Функционал боевой карты находится в разработке и будет доступен в следующих обновлениях.
          </p>
          <Button onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayBattlePage;
