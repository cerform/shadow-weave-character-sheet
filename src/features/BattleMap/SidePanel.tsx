/**
 * Боковая панель боевой карты
 * Поиск монстров, добавление на карту, управление
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBattleController } from './hooks/useBattleController';
import ruTranslations from '@/i18n/ru.json';
import { 
  Search,
  Plus,
  Crown,
  Eye,
  EyeOff,
  Grid as GridIcon,
  Map,
  Settings,
  Loader2,
  Users
} from 'lucide-react';

interface SidePanelProps {
  className?: string;
  isDM?: boolean;
  onAddMonster?: (position: [number, number, number]) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  className = '', 
  isDM = false,
  onAddMonster 
}) => {
  const {
    searchMonsters,
    addMonsterToMap,
    getTokens,
    getBattleState,
    toggleFogOfWar,
    revealArea,
  } = useBattleController();

  const tokens = getTokens();
  const battleState = getBattleState();
  const t = ruTranslations.battle;

  // State variables
  const [activeTab, setActiveTab] = useState<'monsters' | 'tokens' | 'settings'>('monsters');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fogEnabled, setFogEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);

  // Поиск монстров
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchMonsters(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Добавление монстра на карту
  const handleAddMonster = async (monsterIndex: string) => {
    // Добавляем в центр карты или на последнюю кликнутую позицию
    const position: [number, number, number] = [0, 0, 0];
    
    try {
      const token = await addMonsterToMap(monsterIndex, position);
      if (token) {
        console.log(`✅ Добавлен монстр: ${token.name}`);
        onAddMonster?.(position);
      }
    } catch (error) {
      console.error('Failed to add monster:', error);
    }
  };

  // Быстрое добавление игрока
  const handleAddPlayer = () => {
    const playerName = `Игрок ${tokens.filter(t => !t.isEnemy).length + 1}`;
    // TODO: интеграция с BattleEngine для добавления игрока
    console.log('➕ Добавление игрока:', playerName);
  };

  return (
    <Card className={`bg-background/90 backdrop-blur-sm w-80 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {isDM ? (
            <>
              <Crown className="w-4 h-4 text-primary" />
              DM Panel
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-primary" />
              Панель игрока
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Переключатель панелей */}
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'monsters' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('monsters')}
            className="flex-1"
            disabled={!isDM}
          >
            <Crown className="w-4 h-4 mr-1" />
            Монстры
          </Button>
          <Button
            variant={activeTab === 'tokens' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tokens')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-1" />
            Токены
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-1" />
            Настройки
          </Button>
        </div>

        {/* Панель поиска монстров (только для ДМ) */}
        {activeTab === 'monsters' && isDM && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Поиск монстров D&D 5e</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Введите название..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Результаты поиска */}
            {searchResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Результаты поиска</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {searchResults.map((monster) => (
                      <div
                        key={monster.index}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{monster.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMonster(monster.index)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Separator />

            {/* Быстрое добавление */}
            <div>
              <h4 className="text-sm font-medium mb-2">Быстрое добавление</h4>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddPlayer}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить игрока
              </Button>
            </div>
          </div>
        )}

        {/* Панель токенов */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Токены на карте ({tokens.length})</h4>
            
            {tokens.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Нет токенов на карте
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className={`p-3 border rounded transition-colors ${
                        battleState?.currentTokenId === token.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{token.name}</span>
                        <Badge variant={token.isEnemy ? 'destructive' : 'default'}>
                          {token.isEnemy ? 'Враг' : 'Игрок'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>HP: {token.hp}/{token.maxHp}</span>
                        <span>AC: {token.ac}</span>
                      </div>
                      
                      {token.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {token.conditions.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Панель настроек */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{t.ui.fogOfWar}</span>
                </div>
                <Switch
                  checked={fogEnabled}
                  onCheckedChange={(checked) => {
                    setFogEnabled(checked);
                    toggleFogOfWar();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GridIcon className="w-4 h-4" />
                  <span className="text-sm">{t.ui.grid}</span>
                </div>
                <Switch
                  checked={gridEnabled}
                  onCheckedChange={setGridEnabled}
                />
              </div>
            </div>

            {isDM && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Инструменты ДМ</h4>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => revealArea([0, 0, 0], 5)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Показать область
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Загрузить карту
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};