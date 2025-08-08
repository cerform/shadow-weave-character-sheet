import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Map, ArrowLeft, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import MapUploadFor3D from '@/components/battle/MapUploadFor3D';
import Simple3DMap from '@/components/battle/Simple3DMap';
import { useSimpleBattleStore } from '@/stores/simpleBattleStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllMonsterTypes } from '@/data/monsterTypes';

const BattleMap3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [generatedMapData, setGeneratedMapData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenType, setNewTokenType] = useState<'player' | 'monster' | 'npc'>('monster');
  const [newTokenMonsterType, setNewTokenMonsterType] = useState('goblin');
  
  // Используем store для токенов
  const { tokens, selectedTokenId, addToken, updateToken, removeToken, selectToken } = useSimpleBattleStore();

  // Проверяем наличие переданного изображения
  useEffect(() => {
    const savedMapUrl = sessionStorage.getItem('current3DMapUrl');
    if (savedMapUrl) {
      // Автоматически генерируем 3D из переданного изображения
      processExistingImage(savedMapUrl);
      sessionStorage.removeItem('current3DMapUrl'); // Очищаем после использования
    }
  }, []);

  const processExistingImage = async (imageUrl: string) => {
    try {
      // Создаем настройки по умолчанию
      const defaultSettings = {
        heightIntensity: 50,
        smoothness: 20,
        generateHeightFromColors: true,
        invertHeight: false,
        gridSize: 1
      };

      // Генерируем карту высот и текстуру из существующего изображения
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Используем оригинальное изображение как текстуру и генерируем карту высот
        const mapData = {
          originalImage: imageUrl,
          heightMap: imageUrl, // Используем то же изображение для карты высот
          textureMap: imageUrl,
          dimensions: { width: img.width, height: img.height },
          settings: defaultSettings
        };

        setGeneratedMapData(mapData);
        setCurrentStep('preview');
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Ошибка обработки изображения:', error);
      toast.error('Ошибка обработки изображения');
    }
  };

  const handleMapGenerated = (mapData: any) => {
    setGeneratedMapData(mapData);
    setCurrentStep('preview');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setGeneratedMapData(null);
  };

  const handleAddToken = () => {
    setShowTokenEditor(true);
  };

  const handleSaveToken = () => {
    if (!newTokenName.trim()) return;
    
    addToken({
      name: newTokenName,
      x: 400,
      y: 300,
      color: newTokenType === 'monster' ? '#ef4444' : '#3b82f6',
      size: 50,
      hp: newTokenType === 'monster' ? 15 : 30,
      maxHp: newTokenType === 'monster' ? 15 : 30,
      ac: 13,
      type: newTokenType,
      controlledBy: newTokenType === 'player' ? 'player' : 'dm',
      monsterType: newTokenType === 'monster' ? newTokenMonsterType : undefined
    });
    
    setShowTokenEditor(false);
    setNewTokenName('');
    setNewTokenType('monster');
    setNewTokenMonsterType('goblin');
  };

  return (
    <div className="min-h-screen text-white">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              3D Боевая карта
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Навигация */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            // Всегда возвращаемся на 2D карту
            const sessionId = sessionStorage.getItem('currentSessionId');
            if (sessionId) {
              navigate(`/dm/battle-map/${sessionId}`);
            } else {
              navigate('/battle-map-fixed');
            }
          }}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К 2D карте
        </Button>
        
        {currentStep === 'preview' && (
          <>
            <Button 
              variant="outline" 
              onClick={handleBackToUpload}
              className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Новая карта
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAddToken}
              className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить токен
            </Button>
          </>
        )}
      </div>

      {/* Кнопка домой */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Главная
        </Button>
      </div>

      {/* Основной контент */}
      <div className="w-full h-screen pt-20">
        {currentStep === 'upload' ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full px-4">
              <MapUploadFor3D onMapGenerated={handleMapGenerated} />
              
              {/* Инструкция */}
              <Card className="mt-6 bg-slate-800/60 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">📋 Инструкция</h3>
                  <div className="text-slate-300 text-sm space-y-2">
                    <p>1. Загрузите изображение боевой карты</p>
                    <p>2. Настройте параметры 3D обработки</p>
                    <p>3. Система автоматически создаст рельеф из цветов</p>
                    <p>4. Нажмите "Создать 3D" для генерации</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-500/20 rounded border border-blue-500/30">
                    <p className="text-blue-300 text-xs">
                      💡 Темные области станут низинами, светлые - возвышенностями
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full h-full">
              <Simple3DMap 
                mapImageUrl={generatedMapData?.textureMap}
                tokens={tokens}
                onTokenSelect={selectToken}
                selectedTokenId={selectedTokenId}
              />
            </div>
            
            {/* Редактор токенов */}
            {showTokenEditor && (
              <div className="absolute top-20 right-4 z-30">
                <Card className="bg-slate-800/95 border-slate-700 backdrop-blur-sm w-80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Добавить токен</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Название</Label>
                      <Input
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder="Введите название токена"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Тип</Label>
                      <Select value={newTokenType} onValueChange={(value: 'player' | 'monster' | 'npc') => setNewTokenType(value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="player">Игрок</SelectItem>
                          <SelectItem value="monster">Монстр</SelectItem>
                          <SelectItem value="npc">NPC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newTokenType === 'monster' && (
                      <div>
                        <Label className="text-white">Тип монстра</Label>
                        <Select value={newTokenMonsterType} onValueChange={setNewTokenMonsterType}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllMonsterTypes().map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSaveToken} className="flex-1">
                        Добавить
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTokenEditor(false)}
                        className="flex-1"
                      >
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Информация о выбранном токене */}
            {selectedTokenId && (
              <div className="absolute bottom-4 left-4 z-30">
                <Card className="bg-slate-800/95 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {(() => {
                      const selectedToken = tokens.find(t => t.id === selectedTokenId);
                      return selectedToken ? (
                        <div className="text-white">
                          <h3 className="font-semibold">{selectedToken.name}</h3>
                          <p className="text-sm text-slate-300">HP: {selectedToken.hp}/{selectedToken.maxHp}</p>
                          <p className="text-sm text-slate-300">AC: {selectedToken.ac}</p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => selectToken(null)}
                            >
                              Отменить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                removeToken(selectedTokenId);
                                selectToken(null);
                              }}
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BattleMap3DPage;