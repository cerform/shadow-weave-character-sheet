import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import InteractiveBattleMap from '@/components/battle/InteractiveBattleMap';

const BattleMapPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading, isAuthenticated } = useAuth();

  console.log('BattleMapPageFixed - Auth state:', { user, loading, isAuthenticated });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to auth from BattleMapPageFixed');
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Временно убираем проверку авторизации для отладки
  const isDM = true; // Можно определить роль пользователя из контекста или props

  return <InteractiveBattleMap isDM={isDM} />;
};

export default BattleMapPageFixed;