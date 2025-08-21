// src/components/bestiary/BestiaryPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonsterCard } from './MonsterCard';
import { MonsterDetailsDialog } from './MonsterDetailsDialog';
import { TTGClubImporter } from './TTGClubImporter';
import Open5eImporter from './Open5eImporter';
import AssetUploader from '../assets/AssetUploader';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useMonstersStore } from '@/stores/monstersStore';
import { BattleSystemAdapter } from '@/adapters/battleSystemAdapter';
import { MONSTERS_DATABASE, getCRNumericValue } from '@/data/monsters';
import type { Monster, MonsterFilter } from '@/types/monsters';
import { Search, Filter, Dice6, Users, Crown, Download, Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BestiaryPageProps {
  isDM?: boolean;
  onClose?: () => void;
}

export const BestiaryPage: React.FC<BestiaryPageProps> = ({ 
  isDM = false, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [filter, setFilter] = useState<MonsterFilter>({});
  const [activeTab, setActiveTab] = useState('all');
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isOpen5eImporterOpen, setIsOpen5eImporterOpen] = useState(false);
  const [isAssetUploaderOpen, setIsAssetUploaderOpen] = useState(false);
  
  const { addToken } = useUnifiedBattleStore();
  const { getAllMonsters, addImportedMonsters, loadSupabaseMonsters, isLoadingSupabase } = useMonstersStore();

  // Загружаем монстров из Supabase при инициализации
  useEffect(() => {
    loadSupabaseMonsters();
  }, [loadSupabaseMonsters]);

  // Получаем все монстры из хранилища
  const allMonsters = getAllMonsters();

  // Фильтрация и поиск монстров
  const filteredMonsters = useMemo(() => {
    let monsters = allMonsters;

    // Поиск по тексту
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      monsters = monsters.filter(monster =>
        monster.name.toLowerCase().includes(lowerSearch) ||
        monster.type.toLowerCase().includes(lowerSearch) ||
        monster.environment?.some(env => env.toLowerCase().includes(lowerSearch)) ||
        monster.alignment.toLowerCase().includes(lowerSearch)
      );
    }

    // Фильтр по уровню опасности
    if (filter.challengeRating) {
      monsters = monsters.filter(monster => {
        const cr = getCRNumericValue(monster.challengeRating);
        return cr >= (filter.challengeRating?.min || 0) && 
               cr <= (filter.challengeRating?.max || 30);
      });
    }

    // Фильтр по типу
    if (filter.type && filter.type.length > 0) {
      monsters = monsters.filter(monster => 
        filter.type?.includes(monster.type)
      );
    }

    // Фильтр по размеру
    if (filter.size && filter.size.length > 0) {
      monsters = monsters.filter(monster => 
        filter.size?.includes(monster.size)
      );
    }

    // Фильтр по среде обитания
    if (filter.environment && filter.environment.length > 0) {
      monsters = monsters.filter(monster =>
        monster.environment?.some(env => filter.environment?.includes(env))
      );
    }

    return monsters.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, filter, allMonsters]);

  // Группировка по уровню опасности
  const monstersByCR = useMemo(() => {
    const groups: Record<string, Monster[]> = {};
    filteredMonsters.forEach(monster => {
      const cr = monster.challengeRating;
      if (!groups[cr]) groups[cr] = [];
      groups[cr].push(monster);
    });
    return groups;
  }, [filteredMonsters]);

  // Группировка по типу
  const monstersByType = useMemo(() => {
    const groups: Record<string, Monster[]> = {};
    filteredMonsters.forEach(monster => {
      const type = monster.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(monster);
    });
    return groups;
  }, [filteredMonsters]);

  const handleAddToMap = (monster: Monster) => {
    if (!isDM) {
      toast({
        title: "Доступ запрещён",
        description: "Только ДМ может добавлять монстров на карту",
        variant: "destructive"
      });
      return;
    }

    // Создаём токен из монстра для унифицированной боевой системы
    const token = {
      name: monster.name,
      hp: monster.hitPoints,
      maxHp: monster.hitPoints,
      ac: monster.armorClass,
      position: [0, 0, 0] as [number, number, number],
      conditions: [],
      isEnemy: true,
      isVisible: true,
      size: monster.tokenSize || 1,
      speed: monster.speed.walk ? Math.floor(monster.speed.walk / 5) : 6,
      hasMovedThisTurn: false,
      class: `CR ${monster.challengeRating}`,
      modelUrl: monster.modelUrl,
      avatarUrl: monster.iconUrl
    };

    addToken(token);
    
    toast({
      title: "Монстр добавлен",
      description: `${monster.name} добавлен на боевую карту`,
    });
  };

  const handleViewDetails = (monster: Monster) => {
    setSelectedMonster(monster);
  };

  const handleMonstersImported = (monsters: Monster[]) => {
    addImportedMonsters(monsters);
  };

  const resetFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Dice6 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Бестиарий D&D 5e</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {isLoadingSupabase && <Loader2 className="w-4 h-4 animate-spin" />}
              {filteredMonsters.length} из {allMonsters.length} монстров
              {isDM && " • Режим ДМ"}
              {isLoadingSupabase && " • Загрузка..."}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isDM && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsImporterOpen(true)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                TTG.Club
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen5eImporterOpen(true)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Open5e JSON
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAssetUploaderOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                3D Ассеты
              </Button>
            </>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          )}
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="p-4 border-b space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск монстров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={resetFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </div>

        {/* Быстрые фильтры */}
        <div className="flex flex-wrap gap-2">
          <Select 
            value={filter.challengeRating ? `${filter.challengeRating.min}-${filter.challengeRating.max}` : ''} 
            onValueChange={(value) => {
              if (value && value !== 'all') {
                const [min, max] = value.split('-').map(Number);
                setFilter(prev => ({ ...prev, challengeRating: { min, max } }));
              } else {
                setFilter(prev => ({ ...prev, challengeRating: undefined }));
              }
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Уровень опасности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любой CR</SelectItem>
              <SelectItem value="0-0">CR 0</SelectItem>
              <SelectItem value="0.125-0.5">CR 1/8 - 1/2</SelectItem>
              <SelectItem value="1-4">CR 1-4</SelectItem>
              <SelectItem value="5-10">CR 5-10</SelectItem>
              <SelectItem value="11-30">CR 11+</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filter.type?.[0] || ''} 
            onValueChange={(value) => {
              setFilter(prev => ({ 
                ...prev, 
                type: (value && value !== 'all') ? [value as any] : undefined 
              }));
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Тип существа" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любой тип</SelectItem>
              <SelectItem value="Зверь">Зверь</SelectItem>
              <SelectItem value="Гуманоид">Гуманоид</SelectItem>
              <SelectItem value="Великан">Великан</SelectItem>
              <SelectItem value="Дракон">Дракон</SelectItem>
              <SelectItem value="Исчадие">Исчадие</SelectItem>
              <SelectItem value="Нежить">Нежить</SelectItem>
              <SelectItem value="Элементаль">Элементаль</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start px-4 pt-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Все монстры
            </TabsTrigger>
            <TabsTrigger value="by-cr" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              По уровню опасности
            </TabsTrigger>
            <TabsTrigger value="by-type" className="flex items-center gap-2">
              <Dice6 className="w-4 h-4" />
              По типу
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMonsters.map(monster => (
                  <MonsterCard
                    key={monster.id}
                    monster={monster}
                    onAddToMap={isDM ? handleAddToMap : undefined}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="by-cr" className="mt-0">
              <div className="space-y-6">
                {Object.entries(monstersByCR)
                  .sort(([a], [b]) => getCRNumericValue(a) - getCRNumericValue(b))
                  .map(([cr, monsters]) => (
                    <div key={cr}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="outline">CR {cr}</Badge>
                        <span className="text-muted-foreground">({monsters.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {monsters.map(monster => (
                          <MonsterCard
                            key={monster.id}
                            monster={monster}
                            onAddToMap={isDM ? handleAddToMap : undefined}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="by-type" className="mt-0">
              <div className="space-y-6">
                {Object.entries(monstersByType)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([type, monsters]) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="outline">{type}</Badge>
                        <span className="text-muted-foreground">({monsters.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {monsters.map(monster => (
                          <MonsterCard
                            key={monster.id}
                            monster={monster}
                            onAddToMap={isDM ? handleAddToMap : undefined}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Импортер TTG.Club */}
      <TTGClubImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onMonstersImported={handleMonstersImported}
      />

      {/* Импортер Open5e JSON */}
      {isOpen5eImporterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Импорт из Open5e JSON</h2>
              <Button variant="ghost" onClick={() => setIsOpen5eImporterOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <Open5eImporter />
            </div>
          </div>
        </div>
      )}

      {/* Загрузчик 3D ассетов */}
      {isAssetUploaderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Загрузка 3D Ассетов</h2>
              <Button variant="ghost" onClick={() => setIsAssetUploaderOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <AssetUploader />
            </div>
          </div>
        </div>
      )}

      {/* Диалог с подробностями монстра */}
      {selectedMonster && (
        <MonsterDetailsDialog
          monster={selectedMonster}
          isOpen={!!selectedMonster}
          onClose={() => setSelectedMonster(null)}
          onAddToMap={isDM ? handleAddToMap : undefined}
        />
      )}
    </div>
  );
};