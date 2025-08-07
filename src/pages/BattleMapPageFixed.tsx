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
      
      // Находим активную карту или используем первую доступную
      let activeMap = maps.find(m => m.is_active);
      if (!activeMap && maps.length > 0) {
        activeMap = maps[0];
        // Устанавливаем первую карту как активную
        await sessionService.setActiveMap(sessionId!, activeMap.id);
        sessionData.current_map_id = activeMap.id;
      }
      
      if (activeMap) {
        setMapUrl(activeMap.image_url || '');
        
        // Загружаем токены для активной карты
        const battleTokens = await sessionService.getMapTokens(sessionId!, activeMap.id);
        console.log('🎯 Loaded battle tokens:', battleTokens);
        
        const convertedTokens = battleTokens.map(convertBattleTokenToToken);
        console.log('🎯 Converted tokens:', convertedTokens);
        setTokens(convertedTokens);
      } else {
        // Если нет карт, загружаем все токены сессии
        const allTokens = await sessionService.getMapTokens(sessionId!);
        const convertedTokens = allTokens.map(convertBattleTokenToToken);
        setTokens(convertedTokens);
      }
      
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
    size: Math.max(battleToken.size * 50, 40), // Приводим к размеру в пикселях, минимум 40px
    hp: battleToken.current_hp || battleToken.max_hp || 30,
    maxHp: battleToken.max_hp || 30,
    ac: battleToken.armor_class || 15,
    speed: 30, // Дефолтная скорость
    type: (battleToken.token_type as 'player' | 'monster' | 'npc') || 'monster',
    controlledBy: battleToken.token_type === 'player' ? 'player1' : 'dm',
    tags: Array.isArray(battleToken.conditions) ? battleToken.conditions : [],
    notes: battleToken.notes
  });

  const convertTokenToBattleToken = (token: Token, currentMapId?: string): Omit<BattleToken, 'id' | 'session_id' | 'created_at' | 'updated_at'> => ({
    map_id: currentMapId || session?.current_map_id,
    character_id: undefined,
    name: token.name,
    image_url: token.avatar,
    position_x: token.x,
    position_y: token.y,
    size: Math.max(token.size / 50, 0.8), // Приводим к относительному размеру, минимум 0.8
    color: token.color,
    token_type: token.type,
    current_hp: token.hp,
    max_hp: token.maxHp,
    armor_class: token.ac,
    is_visible: true,
    is_hidden_from_players: token.type === 'monster' && token.controlledBy === 'dm',
    conditions: Array.isArray(token.tags) ? token.tags : [],
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
      
      // Определяем активную карту
      let currentMapId = session?.current_map_id;
      if (!currentMapId) {
        const maps = await sessionService.getSessionMaps(sessionId);
        const activeMap = maps.find(m => m.is_active) || maps[0];
        if (activeMap) {
          currentMapId = activeMap.id;
          await sessionService.setActiveMap(sessionId, activeMap.id);
        }
      }
      
      // Получаем текущие токены из базы
      const currentBattleTokens = await sessionService.getMapTokens(sessionId, currentMapId);
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
            conditions: Array.isArray(token.tags) ? token.tags : [],
            notes: token.notes
          });
        } else {
          // Создаем новый токен
          await sessionService.createToken(sessionId, convertTokenToBattleToken(token, currentMapId));
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
              onClick={() => {
                if (mapUrl) {
                  // Передаем текущее изображение и ID сессии в 3D режим
                  sessionStorage.setItem('current3DMapUrl', mapUrl);
                  sessionStorage.setItem('currentSessionId', sessionId || '');
                  navigate('/battle-map-3d');
                } else {
                  toast.error('Сначала загрузите карту');
                }
              }}
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