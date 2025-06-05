
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Users, 
  Shield, 
  Sword, 
  Map, 
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ClassFilter, AttributeFilter, EquipmentFilter, CampaignFilter, SearchOptions } from '@/types/characterFilters';

interface CharacterFilterPanelProps {
  onFiltersChange: (filters: any) => void;
  onSearchChange: (search: SearchOptions) => void;
  availableClasses: string[];
  availableCampaigns: string[];
  availablePlayers: string[];
}

const CharacterFilterPanel: React.FC<CharacterFilterPanelProps> = ({
  onFiltersChange,
  onSearchChange,
  availableClasses,
  availableCampaigns,
  availablePlayers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [levelRange, setLevelRange] = useState<[number, number]>([1, 20]);
  const [isMulticlass, setIsMulticlass] = useState<boolean | null>(null);
  const [acRange, setAcRange] = useState<[number, number]>([8, 25]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Статистики для фильтрации
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  const [statRanges, setStatRanges] = useState<Record<string, [number, number]>>({
    strength: [3, 20],
    dexterity: [3, 20],
    constitution: [3, 20],
    intelligence: [3, 20],
    wisdom: [3, 20],
    charisma: [3, 20]
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange({
      query,
      fuzzyMatch: true,
      searchFields: ['name', 'background', 'notes', 'description'],
      tags: []
    });
  };

  const handleClassToggle = (className: string) => {
    const newClasses = selectedClasses.includes(className)
      ? selectedClasses.filter(c => c !== className)
      : [...selectedClasses, className];
    setSelectedClasses(newClasses);
    emitFilters();
  };

  const handleStatRangeChange = (stat: string, range: [number, number]) => {
    setStatRanges(prev => ({
      ...prev,
      [stat]: range
    }));
    emitFilters();
  };

  const emitFilters = () => {
    const filters = {
      classes: selectedClasses,
      levelRange,
      isMulticlass,
      statRanges,
      acRange,
      campaigns: selectedCampaigns,
      status: selectedStatus
    };
    onFiltersChange(filters);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedClasses([]);
    setLevelRange([1, 20]);
    setIsMulticlass(null);
    setAcRange([8, 25]);
    setSelectedCampaigns([]);
    setSelectedStatus([]);
    setStatRanges({
      strength: [3, 20],
      dexterity: [3, 20],
      constitution: [3, 20],
      intelligence: [3, 20],
      wisdom: [3, 20],
      charisma: [3, 20]
    });
    onFiltersChange({});
    onSearchChange({
      query: '',
      fuzzyMatch: true,
      searchFields: ['name', 'background', 'notes', 'description'],
      tags: []
    });
  };

  const activeFiltersCount = selectedClasses.length + selectedCampaigns.length + selectedStatus.length + 
    (isMulticlass !== null ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры персонажей
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Очистить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <Input
            placeholder="Поиск персонажей..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
        </div>

        {isExpanded && (
          <Tabs defaultValue="class" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="class">
                <Users className="h-4 w-4 mr-1" />
                Класс
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Shield className="h-4 w-4 mr-1" />
                Характеристики
              </TabsTrigger>
              <TabsTrigger value="equipment">
                <Sword className="h-4 w-4 mr-1" />
                Снаряжение
              </TabsTrigger>
              <TabsTrigger value="campaign">
                <Map className="h-4 w-4 mr-1" />
                Кампания
              </TabsTrigger>
            </TabsList>

            <TabsContent value="class" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Классы</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableClasses.map((className) => (
                    <Button
                      key={className}
                      variant={selectedClasses.includes(className) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleClassToggle(className)}
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Уровень: {levelRange[0]} - {levelRange[1]}</Label>
                <Slider
                  value={levelRange}
                  onValueChange={(value) => setLevelRange(value as [number, number])}
                  max={20}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="multiclass" className="text-sm font-medium">
                  Только мультикласс
                </Label>
                <Switch
                  id="multiclass"
                  checked={isMulticlass === true}
                  onCheckedChange={(checked) => setIsMulticlass(checked ? true : null)}
                />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {stats.map((stat) => (
                    <div key={stat}>
                      <Label className="text-sm font-medium capitalize">
                        {stat === 'strength' ? 'Сила' :
                         stat === 'dexterity' ? 'Ловкость' :
                         stat === 'constitution' ? 'Телосложение' :
                         stat === 'intelligence' ? 'Интеллект' :
                         stat === 'wisdom' ? 'Мудрость' : 'Харизма'}: {statRanges[stat][0]} - {statRanges[stat][1]}
                      </Label>
                      <Slider
                        value={statRanges[stat]}
                        onValueChange={(value) => handleStatRangeChange(stat, value as [number, number])}
                        max={20}
                        min={3}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div>
                <Label className="text-sm font-medium">КД: {acRange[0]} - {acRange[1]}</Label>
                <Slider
                  value={acRange}
                  onValueChange={(value) => setAcRange(value as [number, number])}
                  max={25}
                  min={8}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Sword className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Фильтры снаряжения</p>
                <p className="text-sm">Будут добавлены в следующем обновлении</p>
              </div>
            </TabsContent>

            <TabsContent value="campaign" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Кампании</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableCampaigns.map((campaign) => (
                    <Button
                      key={campaign}
                      variant={selectedCampaigns.includes(campaign) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newCampaigns = selectedCampaigns.includes(campaign)
                          ? selectedCampaigns.filter(c => c !== campaign)
                          : [...selectedCampaigns, campaign];
                        setSelectedCampaigns(newCampaigns);
                        emitFilters();
                      }}
                    >
                      {campaign}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Статус персонажа</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Активный', 'На пенсии', 'Погиб'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus.includes(status) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newStatus = selectedStatus.includes(status)
                          ? selectedStatus.filter(s => s !== status)
                          : [...selectedStatus, status];
                        setSelectedStatus(newStatus);
                        emitFilters();
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Активные фильтры */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {searchQuery && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Поиск: "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearchChange('')} />
                </Badge>
              )}
              {selectedClasses.map((className) => (
                <Badge key={className} variant="outline" className="flex items-center gap-1">
                  {className}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleClassToggle(className)} />
                </Badge>
              ))}
              {isMulticlass && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Мультикласс
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setIsMulticlass(null)} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterFilterPanel;
