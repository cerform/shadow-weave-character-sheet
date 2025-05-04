import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useSpellbook } from '@/hooks/spellbook';
import { SpellData } from '@/hooks/spellbook/types';
import { getAllSpells } from '@/data/spells'; // Правильный импорт

// fix для импорта модуля с заклинаниями
const spells = getAllSpells();

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    selectedSpell,
    isModalOpen,
    activeSchool,
    activeClass,
    currentTheme: spellTheme,
    allLevels,
    allSchools,
    allClasses,
    handleOpenSpell,
    handleClose,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    getBadgeColor,
    getSchoolBadgeColor,
    formatClasses,
    importSpellsFromText
  } = useSpellbook();
  
  const [importText, setImportText] = useState('');
  const [importedSpells, setImportedSpells] = useState<SpellData[]>([]);
  
  const handleImportChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImportText(e.target.value);
  };
  
  const handleImportSpells = () => {
    if (importSpellsFromText) {
      // Преобразуем CharacterSpell[] в SpellData[]
      const convertedSpells: SpellData[] = filteredSpells.map(spell => ({
        ...spell,
        school: spell.school || "Преобразование", // Добавляем школу, если её нет
        castingTime: spell.castingTime || "1 действие",
        range: spell.range || "60 футов",
        components: spell.components || "В, С",
        duration: spell.duration || "Мгновенно"
      }));
      
      const newSpells = importSpellsFromText(importText, convertedSpells);
      
      if (newSpells && newSpells.length > 0) {
        // Преобразуем CharacterSpell[] в SpellData[]
        const convertedNewSpells: SpellData[] = newSpells.map(spell => ({
          ...spell,
          school: spell.school || "Преобразование", // Добавляем школу, если её нет
          castingTime: spell.castingTime || "1 действие",
          range: spell.range || "60 футов",
          components: spell.components || "В, С",
          duration: spell.duration || "Мгновенно"
        }));
        
        setImportedSpells(convertedNewSpells);
      }
    }
  };

  // Конвертируем CharacterSpell[] в SpellData[]
  const convertSpellsToSpellData = (spells: any[]): SpellData[] => {
    return spells.map(spell => ({
      ...spell,
      school: spell.school || "Преобразование", // Добавляем школу, если её нет
      castingTime: spell.castingTime || "1 действие",
      range: spell.range || "60 футов",
      components: spell.components || "В, С",
      duration: spell.duration || "Мгновенно"
    }));
  };

  // При использовании:
  const spellsAsSpellData: SpellData[] = convertSpellsToSpellData(spells || []);

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Книга заклинаний</h1>
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Поиск заклинания..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={clearFilters}>Сбросить фильтры</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Filters */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Уровень</CardTitle>
              <CardDescription>Выберите уровни заклинаний</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {allLevels.map(level => (
                  <Badge
                    key={level}
                    variant={activeLevel.includes(level) ? "default" : "outline"}
                    onClick={() => toggleLevel(level)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: activeLevel.includes(level) ? spellTheme.accent : 'transparent',
                      color: activeLevel.includes(level) ? spellTheme.textColor : spellTheme.accent,
                      borderColor: spellTheme.accent
                    }}
                  >
                    {level === 0 ? 'Заговор' : level}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Школа</CardTitle>
              <CardDescription>Выберите школы магии</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {allSchools.map(school => (
                  <Badge
                    key={school}
                    variant={activeSchool.includes(school) ? "default" : "outline"}
                    onClick={() => toggleSchool(school)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: activeSchool.includes(school) ? spellTheme.accent : 'transparent',
                      color: activeSchool.includes(school) ? spellTheme.textColor : spellTheme.accent,
                      borderColor: spellTheme.accent
                    }}
                  >
                    {school}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Классы</CardTitle>
              <CardDescription>Выберите классы, использующие заклинания</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {allClasses.map(className => (
                  <Badge
                    key={className}
                    variant={activeClass.includes(className) ? "default" : "outline"}
                    onClick={() => toggleClass(className)}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: activeClass.includes(className) ? spellTheme.accent : 'transparent',
                      color: activeClass.includes(className) ? spellTheme.textColor : spellTheme.accent,
                      borderColor: spellTheme.accent
                    }}
                  >
                    {className}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spell List */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Список заклинаний</CardTitle>
              <CardDescription>Нажмите на заклинание, чтобы увидеть детали</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid gap-2">
                  {filteredSpells.map(spell => (
                    <Card
                      key={spell.name}
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleOpenSpell(spell)}
                    >
                      <CardContent className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <CardTitle className="text-sm">{spell.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {formatClasses(spell.classes)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" style={{backgroundColor: getBadgeColor(spell.level)}}>
                          {spell.level === 0 ? 'Заговор' : spell.level}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Import Section */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Импорт заклинаний</CardTitle>
              <CardDescription>Импортируйте заклинания из текста</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <textarea
                placeholder="Вставьте сюда текст для импорта..."
                className="w-full h-32 border rounded-md p-2 text-black"
                value={importText}
                onChange={handleImportChange}
              />
              <Button onClick={handleImportSpells}>Импортировать</Button>
              {importedSpells.length > 0 && (
                <div className="space-y-2">
                  <p>Импортированные заклинания:</p>
                  {importedSpells.map(spell => (
                    <div key={spell.name} className="text-sm">
                      {spell.name} (Уровень {spell.level})
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Spell Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSpell?.name}</DialogTitle>
            <DialogDescription>
              <Badge variant="secondary" style={{backgroundColor: getSchoolBadgeColor(selectedSpell?.school || '')}}>
                {selectedSpell?.school}
              </Badge>
              <Badge variant="secondary" style={{backgroundColor: getBadgeColor(selectedSpell?.level || 0)}}>
                {selectedSpell?.level === 0 ? 'Заговор' : selectedSpell?.level}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Описание</h3>
                {Array.isArray(selectedSpell?.description) ? (
                  selectedSpell?.description.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>{selectedSpell?.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Информация</h3>
                <p><strong>Время кастинга:</strong> {selectedSpell?.castingTime}</p>
                <p><strong>Дистанция:</strong> {selectedSpell?.range}</p>
                <p><strong>Компоненты:</strong> {selectedSpell?.components}</p>
                <p><strong>Длительность:</strong> {selectedSpell?.duration}</p>
                {selectedSpell?.higherLevels && (
                  <p><strong>На больших уровнях:</strong> {selectedSpell?.higherLevels}</p>
                )}
                {selectedSpell?.classes && (
                  <p><strong>Классы:</strong> {formatClasses(selectedSpell?.classes)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpellBookViewer;
