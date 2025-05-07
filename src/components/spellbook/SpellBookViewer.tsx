
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Filter, AlertCircle } from "lucide-react";
import SpellDetailModal from './SpellDetailModal';
import SpellFilterPanel from './SpellFilterPanel';
import SpellTable from './SpellTable';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';
import SpellList from './SpellList';

const SpellBookViewer: React.FC = () => {
  const { themeStyles } = useTheme();
  const [showTable, setShowTable] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const {
    filteredSpells,
    spells,
    searchText,
    setSearchText,
    handleOpenSpell,
    selectedSpell,
    handleClose,
    isModalOpen,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    allLevels,
    allSchools,
    allClasses,
    activeLevel,
    activeSchool,
    activeClass,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    isLoading,
  } = useSpellbook();

  useEffect(() => {
    console.log("SpellBookViewer: Инициализация компонента");
    console.log("SpellBookViewer: Всего заклинаний:", spells.length);
    console.log("SpellBookViewer: Отфильтрованных заклинаний:", filteredSpells.length);
    
    // Показываем уведомление только при первой загрузке
    if (initialLoad && spells.length > 0) {
      toast.success(`Загружено ${spells.length} заклинаний`);
      setInitialLoad(false);
    }
  }, [spells.length, filteredSpells.length, initialLoad]);

  useEffect(() => {
    // Отслеживаем изменение числа отфильтрованных заклинаний
    if (!initialLoad) {
      console.log("SpellBookViewer: Обновлены отфильтрованные заклинания:", filteredSpells.length);
    }
  }, [filteredSpells.length, initialLoad]);
  
  return (
    <div className="space-y-6">
      {/* Панель поиска */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            className="pl-9"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderColor: themeStyles?.accent,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowTable(!showTable)}
            style={{
              borderColor: themeStyles?.accent,
              color: themeStyles?.textColor,
            }}
          >
            {showTable ? "Карточки" : "Таблица"}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            style={{
              borderColor: themeStyles?.accent,
              color: themeStyles?.textColor,
            }}
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
        </div>
      </div>

      {/* Панель фильтров */}
      <SpellFilterPanel
        allLevels={allLevels}
        allSchools={allSchools}
        allClasses={allClasses}
        activeLevel={activeLevel}
        activeSchool={activeSchool}
        activeClass={activeClass}
        toggleLevel={toggleLevel}
        toggleSchool={toggleSchool}
        toggleClass={toggleClass}
        clearFilters={clearFilters}
      />

      {/* Список заклинаний */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : spells.length === 0 ? (
        <div className="text-center py-12 bg-black/30 rounded-lg border border-accent/20">
          <AlertCircle className="mx-auto h-12 w-12 mb-4 text-amber-500" />
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeStyles?.textColor }}>
            Ошибка загрузки заклинаний
          </h3>
          <p className="text-muted-foreground mb-4">
            Не удалось загрузить список заклинаний из базы данных.
          </p>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </Button>
        </div>
      ) : filteredSpells.length > 0 ? (
        showTable ? (
          <div className="rounded-md border border-accent/30 overflow-hidden">
            <SpellTable 
              spells={filteredSpells}
              onSpellClick={handleOpenSpell}
              currentTheme={themeStyles}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpells.map((spell) => (
              <Card
                key={spell.id || spell.name}
                className="h-full cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenSpell(spell)}
                style={{
                  borderColor: themeStyles?.accent,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold" style={{ color: themeStyles?.textColor }}>
                      {spell.name}
                    </h3>
                    <Badge
                      className={getBadgeColor(spell.level)}
                      variant={spell.level === 0 ? "outline" : "default"}
                    >
                      {spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className={getSchoolBadgeColor(spell.school)}>
                      {spell.school}
                    </Badge>
                    {spell.ritual && (
                      <Badge variant="outline">Ритуал</Badge>
                    )}
                    {spell.concentration && (
                      <Badge variant="outline">Концентрация</Badge>
                    )}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="text-sm" style={{ color: themeStyles?.textColor }}>
                    <div><strong>Время накладывания:</strong> {spell.castingTime}</div>
                    <div><strong>Дистанция:</strong> {spell.range}</div>
                    <div><strong>Компоненты:</strong> {spell.components}</div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    <BookOpen className="inline-block h-3 w-3 mr-1" />
                    {formatClasses(spell.classes)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2" style={{ color: themeStyles?.textColor }}>
            Заклинания не найдены
          </h3>
          <p className="text-muted-foreground">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
          {(activeLevel.length > 0 || activeSchool.length > 0 || activeClass.length > 0 || searchText) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Сбросить все фильтры
            </Button>
          )}
        </div>
      )}

      {/* Модальное окно для отображения деталей заклинания */}
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          open={isModalOpen}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
