import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import TacticalBattleMap, { Token } from '@/components/battle/TacticalBattleMap';
import { sessionService } from '@/services/sessionService';
import type { BattleToken, GameSession } from '@/services/sessionService';

const BattleMapPageFixed: React.FC = () => {
  console.log('🔍 BattleMapPageFixed: компонент загружается');
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  
  // Состояние для токенов и карты
  const [tokens, setTokens] = useState<Token[]>([]);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка данных сессии
  useEffect(() => {
    if (!sessionId) {
      toast.error('ID сессии не найден');
      navigate('/dm');
      return;
    }

    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем сессию
      const sessionData = await sessionService.getSession(sessionId!);
      setSession(sessionData);
      
      // Загружаем карты сессии
      const maps = await sessionService.getSessionMaps(sessionId!);
      const activeMap = maps.find(m => m.is_active);
      if (activeMap) {
        setMapUrl(activeMap.image_url || '');
      }
      
      // Загружаем токены
      const battleTokens = await sessionService.getMapTokens(sessionId!, activeMap?.id);
      const convertedTokens = battleTokens.map(convertBattleTokenToToken);
      setTokens(convertedTokens);
      
      toast.success('Данные сессии загружены');
    } catch (error) {
      console.error('Ошибка загрузки сессии:', error);
      toast.error('Ошибка загрузки данных сессии');
    } finally {
      setIsLoading(false);
    }
  };

  // Конвертация между типами токенов
  const convertBattleTokenToToken = (battleToken: BattleToken): Token => ({
    id: battleToken.id,
    name: battleToken.name,
    avatar: battleToken.image_url,
    x: battleToken.position_x,
    y: battleToken.position_y,
    color: battleToken.color,
    size: battleToken.size * 50, // Приводим к размеру в пикселях
    hp: battleToken.current_hp || 30,
    maxHp: battleToken.max_hp || 30,
    ac: battleToken.armor_class || 15,
    speed: 30, // Дефолтная скорость
    type: battleToken.token_type as 'player' | 'monster' | 'npc',
    controlledBy: battleToken.token_type === 'player' ? 'player1' : 'dm',
    tags: battleToken.conditions || [],
    notes: battleToken.notes
  });

  const convertTokenToBattleToken = (token: Token): Omit<BattleToken, 'id' | 'session_id' | 'created_at' | 'updated_at'> => ({
    map_id: session?.current_map_id,
    character_id: undefined,
    name: token.name,
    image_url: token.avatar,
    position_x: token.x,
    position_y: token.y,
    size: token.size / 50, // Приводим к относительному размеру
    color: token.color,
    token_type: token.type,
    current_hp: token.hp,
    max_hp: token.maxHp,
    armor_class: token.ac,
    is_visible: true,
    is_hidden_from_players: token.type === 'monster' && token.controlledBy === 'dm',
    conditions: token.tags || [],
    notes: token.notes
  });

  // Обработчик изменения токенов с автосохранением
  const handleTokensChange = useCallback(async (newTokens: Token[]) => {
    console.log('🔄 BattleMapPageFixed: токены изменились:', newTokens);
    setTokens(newTokens);
    
    // Автосохранение
    if (!sessionId || isLoading) return;
    
    try {
      setIsSaving(true);
      
      // Получаем текущие токены из базы
      const currentBattleTokens = await sessionService.getMapTokens(sessionId, session?.current_map_id);
      const currentTokenIds = new Set(currentBattleTokens.map(t => t.id));
      
      // Обновляем существующие токены и создаем новые
      for (const token of newTokens) {
        if (currentTokenIds.has(token.id)) {
          // Обновляем существующий токен
          await sessionService.updateToken(token.id, {
            name: token.name,
            image_url: token.avatar,
            position_x: token.x,
            position_y: token.y,
            color: token.color,
            current_hp: token.hp,
            max_hp: token.maxHp,
            armor_class: token.ac,
            conditions: token.tags || [],
            notes: token.notes
          });
        } else {
          // Создаем новый токен
          await sessionService.createToken(sessionId, convertTokenToBattleToken(token));
        }
      }
      
      // Удаляем токены, которые больше не существуют
      const newTokenIds = new Set(newTokens.map(t => t.id));
      for (const battleToken of currentBattleTokens) {
        if (!newTokenIds.has(battleToken.id)) {
          await sessionService.deleteToken(battleToken.id);
        }
      }
      
      console.log('✅ Токены сохранены в базу данных');
    } catch (error) {
      console.error('❌ Ошибка сохранения токенов:', error);
      toast.error('Ошибка сохранения токенов');
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, session, isLoading]);

  // Обработчик изменения карты
  const handleMapChange = useCallback(async (newMapUrl: string) => {
    setMapUrl(newMapUrl);
    
    if (!sessionId) return;
    
    try {
      setIsSaving(true);
      
      // Создаем новую карту или обновляем существующую
      if (session?.current_map_id) {
        // Обновляем существующую карту
        await sessionService.updateSessionSettings(sessionId, {
          current_map_id: session.current_map_id
        });
      } else {
        // Создаем новую карту
        const newMap = await sessionService.createMap(sessionId, 'Battle Map', newMapUrl);
        await sessionService.setActiveMap(sessionId, newMap.id);
      }
      
      toast.success('Карта сохранена');
    } catch (error) {
      console.error('Ошибка сохранения карты:', error);
      toast.error('Ошибка сохранения карты');
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, session]);

  // Ручное сохранение
  const handleManualSave = async () => {
    if (!sessionId) return;
    
    try {
      setIsSaving(true);
      await handleTokensChange(tokens);
      toast.success('Состояние боевой карты сохранено');
    } catch (error) {
      console.error('Ошибка ручного сохранения:', error);
      toast.error('Ошибка сохранения');
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Загрузка сессии...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <div className="text-xl mb-4">Сессия не найдена</div>
          <Button onClick={() => navigate('/dm')}>Вернуться к панели DM</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{session.name} - Боевая карта</h1>
            <div className="text-sm text-slate-400">
              Сессия: {session.session_code} 
              {isSaving && <span className="ml-2 text-yellow-400">• Сохранение...</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleManualSave}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
            <Button 
              onClick={() => navigate('/battle-map-3d')}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              Переключить на 3D
            </Button>
            <Button 
              onClick={() => navigate('/dm')}
              className="bg-slate-600 hover:bg-slate-700"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Панель DM
            </Button>
          </div>
        </div>
      </div>

      {/* Карта на весь экран */}
      <div className="w-full h-full pt-20">
        <TacticalBattleMap
          isDM={true}
          tokens={tokens}
          onTokensChange={handleTokensChange}
          mapImageUrl={mapUrl}
          onMapChange={handleMapChange}
        />
      </div>
    </div>
  );
};

export default BattleMapPageFixed;