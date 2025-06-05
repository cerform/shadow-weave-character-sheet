
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CharacterFilterPanel from '@/components/character/CharacterFilterPanel';
import { useCharacterFilters, Character } from '@/hooks/character/useCharacterFilters';
import { Users, Eye, Edit, Trash2 } from 'lucide-react';

// Тестовые данные персонажей
const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Эльдара Лунная Песня',
    class: 'Следопыт',
    subclass: 'Охотник',
    level: 5,
    background: 'Отшельник',
    race: 'Эльф',
    alignment: 'Хаотично-добрый',
    stats: {
      strength: 10,
      dexterity: 18,
      constitution: 14,
      intelligence: 12,
      wisdom: 16,
      charisma: 8
    },
    armorClass: 15,
    hitPoints: 45,
    campaign: 'Проклятие Страда',
    player: 'Алексей',
    status: 'active',
    lastModified: new Date('2024-01-15'),
    isMulticlass: false,
    notes: 'Специализируется на стрельбе из лука',
    description: 'Молчаливая эльфийка с острым глазом'
  },
  {
    id: '2',
    name: 'Торин Железнобород',
    class: 'Воин',
    subclass: 'Чемпион',
    level: 8,
    background: 'Солдат',
    race: 'Дварф',
    alignment: 'Законно-добрый',
    stats: {
      strength: 18,
      dexterity: 12,
      constitution: 16,
      intelligence: 10,
      wisdom: 14,
      charisma: 8
    },
    armorClass: 18,
    hitPoints: 78,
    campaign: 'Принцы Апокалипсиса',
    player: 'Михаил',
    status: 'active',
    lastModified: new Date('2024-01-20'),
    isMulticlass: true,
    notes: 'Мультикласс Воин/Паладин',
    description: 'Благородный дварф-воин с чувством справедливости'
  },
  {
    id: '3',
    name: 'Зефира Звездная Пыль',
    class: 'Волшебник',
    subclass: 'Школа Воплощения',
    level: 12,
    background: 'Мудрец',
    race: 'Полуэльф',
    alignment: 'Нейтрально-добрый',
    stats: {
      strength: 8,
      dexterity: 14,
      constitution: 12,
      intelligence: 20,
      wisdom: 13,
      charisma: 16
    },
    armorClass: 12,
    hitPoints: 60,
    campaign: 'Буря Королей',
    player: 'Анна',
    status: 'retired',
    lastModified: new Date('2024-01-10'),
    isMulticlass: false,
    notes: 'Мастер боевой магии',
    description: 'Могущественная волшебница с загадочным прошлым'
  }
];

const CharacterManagementPage: React.FC = () => {
  const {
    filteredCharacters,
    availableClasses,
    availableCampaigns,
    availablePlayers,
    updateFilters,
    updateSearch,
    totalCount,
    filteredCount
  } = useCharacterFilters({ characters: mockCharacters });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { variant: 'default' as const, label: 'Активный' },
      retired: { variant: 'secondary' as const, label: 'На пенсии' },
      deceased: { variant: 'destructive' as const, label: 'Погиб' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление персонажами</h1>
          <p className="text-muted-foreground">
            Найдено {filteredCount} из {totalCount} персонажей
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Создать персонажа
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CharacterFilterPanel
            onFiltersChange={updateFilters}
            onSearchChange={updateSearch}
            availableClasses={availableClasses}
            availableCampaigns={availableCampaigns}
            availablePlayers={availablePlayers}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCharacters.map((character) => (
              <Card key={character.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{character.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {character.race} {character.class} {character.level}
                      </p>
                      {character.subclass && (
                        <p className="text-xs text-muted-foreground">
                          {character.subclass}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(character.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium">КД</div>
                      <div>{character.armorClass}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">ОЗ</div>
                      <div>{character.hitPoints}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Уровень</div>
                      <div>{character.level}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="font-medium">СИЛ</div>
                      <div className="flex flex-col">
                        <span>{character.stats.strength}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.strength))}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">ЛОВ</div>
                      <div className="flex flex-col">
                        <span>{character.stats.dexterity}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.dexterity))}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">ТЕЛ</div>
                      <div className="flex flex-col">
                        <span>{character.stats.constitution}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.constitution))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <div className="font-medium">ИНТ</div>
                      <div className="flex flex-col">
                        <span>{character.stats.intelligence}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.intelligence))}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">МУД</div>
                      <div className="flex flex-col">
                        <span>{character.stats.wisdom}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.wisdom))}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">ХАР</div>
                      <div className="flex flex-col">
                        <span>{character.stats.charisma}</span>
                        <span className="text-muted-foreground">
                          {formatModifier(getStatModifier(character.stats.charisma))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {character.campaign && (
                    <div className="text-xs">
                      <span className="font-medium">Кампания:</span> {character.campaign}
                    </div>
                  )}

                  {character.player && (
                    <div className="text-xs">
                      <span className="font-medium">Игрок:</span> {character.player}
                    </div>
                  )}

                  {character.isMulticlass && (
                    <Badge variant="outline" className="text-xs">
                      Мультикласс
                    </Badge>
                  )}

                  <div className="flex justify-between pt-2 border-t">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Персонажи не найдены</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить критерии поиска или очистить фильтры
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterManagementPage;
