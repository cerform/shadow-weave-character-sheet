import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import InteractiveBattleMap from '@/components/battle/InteractiveBattleMap';

const BattleMapPageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  if (!user) {
    return null;
  }

  const isDM = true; // Можно определить роль пользователя из контекста или props

  return <InteractiveBattleMap isDM={isDM} />;
};

export default BattleMapPageFixed;