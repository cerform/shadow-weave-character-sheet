
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, Filter, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: {
    searchTerm: string;
    activeLevel: number[];
    activeSchool: string[];
    activeClass: string[];
    isRitualOnly: boolean;
    isConcentrationOnly: boolean;
    verbalComponent: boolean | null;
    somaticComponent: boolean | null;
    materialComponent: boolean | null;
    activeCastingTimes: string[];
    activeRangeTypes: string[];
    activeDurationTypes: string[];
    activeSources: string[];
  };
  createdAt: Date;
  isFavorite?: boolean;
}

interface SavedFiltersManagerProps {
  currentFilters: SavedFilter['filters'];
  onApplyFilters: (filters: SavedFilter['filters']) => void;
  onClearFilters: () => void;
}

const SavedFiltersManager: React.FC<SavedFiltersManagerProps> = ({
  currentFilters,
  onApplyFilters,
  onClearFilters
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem('spellbook-saved-filters');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  // Предустановленные наборы фильтров
  const presetFilters: SavedFilter[] = [
    {
      id: 'combat-spells',
      name: 'Боевые заклинания',
      description: 'Заклинания для боя и нанесения урона',
      filters: {
        searchTerm: '',
        activeLevel: [],
        activeSchool: ['Воплощение', 'Evocation'],
        activeClass: [],
        isRitualOnly: false,
        isConcentrationOnly: false,
        verbalComponent: null,
        somaticComponent: null,
        materialComponent: null,
        activeCastingTimes: ['action', 'bonus'],
        activeRangeTypes: [],
        activeDurationTypes: ['instant'],
        activeSources: []
      },
      createdAt: new Date(),
      isFavorite: true
    },
    {
      id: 'utility-spells',
      name: 'Утилитарные заклинания',
      description: 'Заклинания для исследования и решения проблем',
      filters: {
        searchTerm: '',
        activeLevel: [],
        activeSchool: ['Прорицание', 'Преобразование', 'Divination', 'Transmutation'],
        activeClass: [],
        isRitualOnly: false,
        isConcentrationOnly: false,
        verbalComponent: null,
        somaticComponent: null,
        materialComponent: null,
        activeCastingTimes: [],
        activeRangeTypes: [],
        activeDurationTypes: [],
        activeSources: []
      },
      createdAt: new Date(),
      isFavorite: true
    },
    {
      id: 'healing-spells',
      name: 'Лечение',
      description: 'Заклинания восстановления и поддержки',
      filters: {
        searchTerm: 'лечение восстановление heal cure',
        activeLevel: [],
        activeSchool: [],
        activeClass: ['Клирик', 'Паладин', 'Друид', 'Cleric', 'Paladin', 'Druid'],
        isRitualOnly: false,
        isConcentrationOnly: false,
        verbalComponent: null,
        somaticComponent: null,
        materialComponent: null,
        activeCastingTimes: [],
        activeRangeTypes: [],
        activeDurationTypes: [],
        activeSources: []
      },
      createdAt: new Date(),
      isFavorite: true
    }
  ];

  const saveCurrentFilters = () => {
    if (!filterName.trim()) {
      toast.error('Введите название для набора фильтров');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      description: filterDescription.trim() || undefined,
      filters: currentFilters,
      createdAt: new Date()
    };

    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('spellbook-saved-filters', JSON.stringify(updatedFilters));
    
    setFilterName('');
    setFilterDescription('');
    setIsDialogOpen(false);
    toast.success(`Набор фильтров "${newFilter.name}" сохранен`);
  };

  const deleteFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    localStorage.setItem('spellbook-saved-filters', JSON.stringify(updatedFilters));
    toast.success('Набор фильтров удален');
  };

  const toggleFavorite = (filterId: string) => {
    const updatedFilters = savedFilters.map(f => 
      f.id === filterId ? { ...f, isFavorite: !f.isFavorite } : f
    );
    setSavedFilters(updatedFilters);
    localStorage.setItem('spellbook-saved-filters', JSON.stringify(updatedFilters));
  };

  const getFilterSummary = (filters: SavedFilter['filters']) => {
    const parts = [];
    if (filters.searchTerm) parts.push(`Поиск: "${filters.searchTerm}"`);
    if (filters.activeLevel.length) parts.push(`Уровни: ${filters.activeLevel.length}`);
    if (filters.activeSchool.length) parts.push(`Школы: ${filters.activeSchool.length}`);
    if (filters.activeClass.length) parts.push(`Классы: ${filters.activeClass.length}`);
    if (filters.isRitualOnly) parts.push('Ритуалы');
    if (filters.isConcentrationOnly) parts.push('Концентрация');
    return parts.join(', ') || 'Без фильтров';
  };

  const allFilters = [...presetFilters, ...savedFilters];
  const favoriteFilters = allFilters.filter(f => f.isFavorite);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Сохраненные фильтры</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Сохранить текущие
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Сохранить набор фильтров</DialogTitle>
              <DialogDescription>
                Создайте именованный набор из текущих настроек фильтров
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Мои боевые заклинания"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Описание (опционально)</label>
                <Input
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Заклинания для боя на средних уровнях"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Текущие фильтры:</strong> {getFilterSummary(currentFilters)}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={saveCurrentFilters}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {favoriteFilters.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            Избранные
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {favoriteFilters.map((filter) => (
              <Card key={filter.id} className="cursor-pointer hover:bg-accent/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{filter.name}</h5>
                    <div className="flex items-center space-x-1">
                      {!presetFilters.find(p => p.id === filter.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(filter.id);
                            }}
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFilter(filter.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {filter.description && (
                    <p className="text-xs text-muted-foreground mb-2">{filter.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground mb-2">
                    {getFilterSummary(filter.filters)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onApplyFilters(filter.filters)}
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    Применить
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {savedFilters.filter(f => !f.isFavorite).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Мои фильтры</h4>
          <div className="space-y-2">
            {savedFilters.filter(f => !f.isFavorite).map((filter) => (
              <div key={filter.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{filter.name}</div>
                  {filter.description && (
                    <div className="text-xs text-muted-foreground">{filter.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {getFilterSummary(filter.filters)}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(filter.id)}
                  >
                    <Star className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyFilters(filter.filters)}
                  >
                    Применить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFilter(filter.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allFilters.length === presetFilters.length && (
        <div className="text-center text-muted-foreground py-4">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>У вас нет сохраненных фильтров</p>
          <p className="text-sm">Настройте фильтры и сохраните их для быстрого доступа</p>
        </div>
      )}
    </div>
  );
};

export default SavedFiltersManager;
