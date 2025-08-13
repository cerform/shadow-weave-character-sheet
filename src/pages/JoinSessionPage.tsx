
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const JoinSessionPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Присоединение к сессии</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Функция присоединения к сессии временно недоступна.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinSessionPage;
