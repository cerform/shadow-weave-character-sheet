import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Sword, 
  Shield, 
  Heart, 
  Zap,
  Crown,
  Users,
  Book
} from 'lucide-react';
import { BestiaryEntry } from '@/types/Monster';
import { getAllBestiaryEntries, searchBestiaryEntries } from '@/services/BestiaryService';
import { spawnMonsterFromSlug } from '@/engine/MonsterSpawner';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface MonsterSpawnerProps {
  sessionId: string;
  scene: THREE.Scene | null;
  onMonsterSpawned?: (entityId: string, object3D: THREE.Object3D) => void;
}

export const MonsterSpawner: React.FC<MonsterSpawnerProps> = ({
  sessionId,
  scene,
  onMonsterSpawned
}) => {
  const { user } = useAuth();
  const [monsters, setMonsters] = useState<BestiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [spawning, setSpawning] = useState<string | null>(null);

  useEffect(() => {
    loadMonsters();
  }, []);

  const loadMonsters = async () => {
    try {
      setLoading(true);
      const entries = await getAllBestiaryEntries();
      setMonsters(entries);
    } catch (error) {
      console.error('Failed to load monsters:', error);
      toast.error('Не удалось загрузить бестиарий');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadMonsters();
      return;
    }

    try {
      const results = await searchBestiaryEntries(query);
      setMonsters(results);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Ошибка поиска');
    }
  };

  const handleSpawnMonster = async (monster: BestiaryEntry) => {
    if (!scene || !user?.id || !sessionId) {
      toast.error('Не удается создать монстра: отсутствуют необходимые данные');
      return;
    }

    setSpawning(monster.id);
    
    try {
      // Генерируем случайную позицию рядом с центром карты
      const position = {
        x: (Math.random() - 0.5) * 10, // -5 до 5
        y: 0,
        z: (Math.random() - 0.5) * 10  // -5 до 5
      };

      const result = await spawnMonsterFromSlug({
        sessionId,
        slug: monster.slug,
        position,
        createdBy: user.id,
        scene,
        onReady: onMonsterSpawned
      });

      toast.success(`${monster.name} появился на карте!`, {
        description: `HP: ${monster.hp_average}, AC: ${monster.ac}`
      });

      console.log(`🎉 Successfully spawned: ${monster.name}`, result);
    } catch (error) {
      console.error('Failed to spawn monster:', error);
      toast.error(`Не удалось создать ${monster.name}`, {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    } finally {
      setSpawning(null);
    }
  };

  const getCRColor = (cr: string) => {
    const crValue = cr.toLowerCase();
    if (crValue.includes('1/8') || crValue.includes('1/4')) return 'text-green-600';
    if (crValue.includes('1/2') || crValue.includes('1')) return 'text-yellow-600';
    if (crValue.includes('2') || crValue.includes('3') || crValue.includes('4')) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Загрузка бестиария...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Загружаем существ...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Спавнер монстров
        </CardTitle>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск по названию, типу или CR..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {monsters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Ничего не найдено' : 'Бестиарий пуст'}
              </div>
            ) : (
              monsters.map((monster) => (
                <div
                  key={monster.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{monster.name}</h4>
                      <Badge variant="outline" className={getCRColor(monster.cr_or_level)}>
                        {monster.cr_or_level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {monster.size} {monster.creature_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {monster.hp_average} HP
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        AC {monster.ac}
                      </span>
                      {monster.speed_walk && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {monster.speed_walk} фт
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleSpawnMonster(monster)}
                    disabled={spawning === monster.id}
                    className="flex items-center gap-1 ml-3"
                  >
                    {spawning === monster.id ? (
                      <>
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Спавн
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {monsters.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground text-center">
              Найдено существ: {monsters.length} • Клик "Спавн" добавляет на карту
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};