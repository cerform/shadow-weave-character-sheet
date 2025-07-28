import React from 'react';
import { useParams } from 'react-router-dom';
import DMDashboard from '@/components/battle/DMDashboard';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';

const DMDashboardPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Загрузка панели мастера...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-center">Требуется авторизация</h2>
            <p className="text-muted-foreground text-center mt-2">
              Войдите в систему для доступа к панели мастера подземелий
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DMDashboard sessionId={sessionId} />;
};

export default DMDashboardPage;