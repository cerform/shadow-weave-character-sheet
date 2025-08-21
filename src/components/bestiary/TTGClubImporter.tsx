// Компонент для импорта монстров из TTG.Club
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { TTGClubService } from '@/services/ttgClubService';
import { MonsterImportService } from '@/services/monsterImportService';
import type { Monster } from '@/types/monsters';
import { Download, Search, Globe, AlertCircle, CheckCircle, Loader2, List } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TTGClubImporterProps {
  onMonstersImported: (monsters: Monster[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TTGClubImporter: React.FC<TTGClubImporterProps> = ({
  onMonstersImported,
  isOpen,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToLoad, setTotalToLoad] = useState(0);
  const [importedMonsters, setImportedMonsters] = useState<Monster[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMode, setImportMode] = useState<'search' | 'random' | 'list'>('list');
  const [monsterList, setMonsterList] = useState(`Белдора [Beldora]
Гелрин Фоухаммер [Ghelryn Foehammer]
Даратра Шендрел [Darathra Shendrel]
Дарз Хелгар [Darz Helgar]
Драконий компаньон [Draconic Companion]
Дрейк Компаньон [Drake Companion]
Дух [Geist]
Дух Аберрации [Aberrant Spirit]
Дух воителя [Warrior Spirit]
Дух дикого огня [Wildfire Spirit]
Дух дракона [Draconic Spirit]
Дух жнеца [Reaper Spirit]
Дух Зверя [Bestial Spirit]
Дух Исчадия [Fiendish Spirit]
Дух конструкта [Construct Spirit]
Дух Небожителя [Celestial Spirit]
Дух Нежити [Undead Spirit]
Дух Стихии [Elemental Spirit]
Дух Тени [Shadow Spirit]
Дух Феи [Fey Spirit]
Духовный дракон [Spirit Dragon]
Дювесса Шейн [Duvessa Shane]
Железный паук [Iron Spider]
Заражённый саженец [Blighted Sapling]
Защитник колоды [Deck Defender]
Земной зверь [Beast of the Land]
Истинный тератект [True Teratekt]
Истинный тератект-страж [True Teratekt Guardian]
Компаньон из прошлого [Ancient Companion]
Королевский истинный тератект [Royal True Teratekt]
Крошечный слуга [Tiny servant]
Кукла Халастера [Halaster Puppet]
Маркхэм Саутвелл [Markham Southwell]
Мирош Кселбрин [Miros Xelbrin]
Могучий слуга Леук-о [Mighty Servant of Leuk-o]
Морской зверь [Beast of the Sea]
Наемник [Mercenary]
Наксин Драткала [Naxene Drathkala]
Нарт Тезрин [Narth Tezrin]
Молидей [Molydeus MPMM]
Молидей [Molydeus]
Молох [Moloch]
Диррн [Dyrrn]
Древний золотой дракон [Ancient Gold Dragon]
Древний красный дракон [Ancient Red Dragon]
Белиал [Belial]
Бэл [Bel]
Веломахус Лорхолд [Velomachus Lorehold]
Гласия [Glasya]
Зловещий чемпион опустошения [Grim Champion of Desolation]
Клаут [Klauth]
Кованый Колосс [Warforged Colossus]
Колыбель огненного отпрыска [Cradle of the Fire Scion]
Костччи [Kostchtchie]
Марут [Marut MPMM]
Марут [Marut]
Отпрыск Суртура [Scion of Surtur]
Сларкретел [Slarkrethel]
Фьёрна [Fierna]
Векна Архилич [Vecna the Archlich]
Великий аметистовый вирм [Amethyst Greatwyrm]
Великий изумрудный вирм [Emerald Greatwyrm]
Великий кристаллический вирм [Crystal Greatwyrm]
Великий сапфировый вирм [Sapphire Greatwyrm]
Великий топазный вирм [Topaz Greatwyrm]
Вельзевул [Baalzebul]
Демогоргон [Demogorgon MPMM]
Демогоргон [Demogorgon]
Древний дракон времени [Ancient Time Dragon]
Зариэль [Zariel MPMM]
Зариэль [Zariel]
Колыбель облачного отпрыска [Cradle of the Cloud Scion]
Левистус [Levistus]
Маммон [Mammon]
Нив-Миззет [Niv-Mizzet]
Оркус [Orcus]
Оркус [Orcus MPMM]
Отпрыск Мемнора [Scion of Memnor]
Тромократ [Tromokratis]
Эрцгерцогиня Авернуса Зариэль [Archduke Zariel of Avernus]
Великий белый вирм [White Greatwyrm]
Великий зелёный вирм [Green Greatwyrm]
Великий красный вирм [Red Greatwyrm]
Великий синий вирм [Blue Greatwyrm]
Великий чёрный вирм [Black Greatwyrm]
Диспатер [Dispater]
Колыбель штормового отпрыска [Cradle of the Storm Scion]
Мефистофель [Mephistopheles]
Отпрыск Стронмауса [Scion of Stronmaus]
Великий бронзовый вирм [Bronze Greatwyrm]
Великий золотой вирм [Gold Greatwyrm]
Великий латунный вирм [Brass Greatwyrm]
Великий медный вирм [Copper Greatwyrm]
Великий серебряный вирм [Silver Greatwyrm]
Рак Тулхеш [Rak Tulkhesh]
Сул Хатеш [Sul Khatesh]
Эрифламма [Eriflamme]
Асмодей [Asmodeus]
Аспект Бахамута [Aspect of Bahamut]
Аспект Тиамат [Aspect of Tiamat]
Тараск [Tarrasque]
Тиамат [Tiamat]`);

  const handleRandomImport = async () => {
    setIsLoading(true);
    setProgress(0);
    setImportedMonsters([]);
    
    try {
      const count = 20; // Импортируем 20 случайных монстров
      setTotalToLoad(count);
      
      const monsters = await TTGClubService.importRandomMonsters(count);
      
      setImportedMonsters(monsters);
      onMonstersImported(monsters);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${monsters.length} монстров из TTG.Club`,
      });
    } catch (error) {
      console.error('Ошибка импорта:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать монстров",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleSearchImport = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Введите запрос",
        description: "Введите название монстра для поиска",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setImportedMonsters([]);
    
    try {
      const monsters = await TTGClubService.searchMonsters(searchQuery);
      
      setImportedMonsters(monsters);
      onMonstersImported(monsters);
      
      toast({
        title: "Поиск завершен",
        description: `Найдено ${monsters.length} монстров`,
      });
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось найти монстров",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleListImport = async () => {
    if (!monsterList.trim()) {
      toast({
        title: "Введите список",
        description: "Вставьте список монстров для импорта",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setImportedMonsters([]);
    
    try {
      const monsters = await MonsterImportService.importMonstersFromList(monsterList, (loaded, total) => {
        setProgress((loaded / total) * 100);
      });
      
      setImportedMonsters(monsters);
      onMonstersImported(monsters);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${monsters.length} монстров из списка`,
      });
    } catch (error) {
      console.error('Ошибка импорта:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать монстров из списка",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] m-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Импорт из TTG.Club
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Режимы импорта */}
          <div className="flex gap-2">
            <Button
              variant={importMode === 'random' ? 'default' : 'outline'}
              onClick={() => setImportMode('random')}
              disabled={isLoading}
            >
              Случайный импорт
            </Button>
            <Button
              variant={importMode === 'search' ? 'default' : 'outline'}
              onClick={() => setImportMode('search')}
              disabled={isLoading}
            >
              Поиск монстров
            </Button>
            <Button
              variant={importMode === 'list' ? 'default' : 'outline'}
              onClick={() => setImportMode('list')}
              disabled={isLoading}
            >
              Импорт списка
            </Button>
          </div>

          {/* Поиск */}
          {importMode === 'search' && (
            <div className="flex gap-2">
              <Input
                placeholder="Введите название монстра..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchImport()}
              />
              <Button onClick={handleSearchImport} disabled={isLoading || !searchQuery.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Найти
              </Button>
            </div>
          )}

          {/* Импорт списка */}
          {importMode === 'list' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Вставьте список монстров в формате: "Название [English Name]"
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const predefinedList = `Белдора [Beldora]
Гелрин Фоухаммер [Ghelryn Foehammer]
Даратра Шендрел [Darathra Shendrel]
Дарз Хелгар [Darz Helgar]
Драконий компаньон [Draconic Companion]
Дрейк Компаньон [Drake Companion]
Дух [Geist]
Дух Аберрации [Aberrant Spirit]
Дух воителя [Warrior Spirit]
Дух дикого огня [Wildfire Spirit]
Дух дракона [Draconic Spirit]
Дух жнеца [Reaper Spirit]
Дух Зверя [Bestial Spirit]
Дух Исчадия [Fiendish Spirit]
Дух конструкта [Construct Spirit]
Дух Небожителя [Celestial Spirit]
Дух Нежити [Undead Spirit]
Дух Стихии [Elemental Spirit]
Дух Тени [Shadow Spirit]
Дух Феи [Fey Spirit]
Духовный дракон [Spirit Dragon]
Дювесса Шейн [Duvessa Shane]
Железный паук [Iron Spider]
Заражённый саженец [Blighted Sapling]
Защитник колоды [Deck Defender]
Земной зверь [Beast of the Land]
Истинный тератект [True Teratekt]
Истинный тератект-страж [True Teratekt Guardian]
Компаньон из прошлого [Ancient Companion]
Королевский истинный тератект [Royal True Teratekt]
Крошечный слуга [Tiny servant]
Кукла Халастера [Halaster Puppet]
Маркхэм Саутвелл [Markham Southwell]
Мирош Кселбрин [Miros Xelbrin]
Могучий слуга Леук-о [Mighty Servant of Leuk-o]
Морской зверь [Beast of the Sea]
Наемник [Mercenary]
Наксин Драткала [Naxene Drathkala]
Нарт Тезрин [Narth Tezrin]
Молидей [Molydeus MPMM]
Молидей [Molydeus]
Молох [Moloch]
Диррн [Dyrrn]
Древний золотой дракон [Ancient Gold Dragon]
Древний красный дракон [Ancient Red Dragon]
Белиал [Belial]
Бэл [Bel]
Веломахус Лорхолд [Velomachus Lorehold]
Гласия [Glasya]
Зловещий чемпион опустошения [Grim Champion of Desolation]
Клаут [Klauth]
Кованый Колосс [Warforged Colossus]
Колыбель огненного отпрыска [Cradle of the Fire Scion]
Костччи [Kostchtchie]
Марут [Marut MPMM]
Марут [Marut]
Отпрыск Суртура [Scion of Surtur]
Сларкретел [Slarkrethel]
Фьёрна [Fierna]
Векна Архилич [Vecna the Archlich]
Великий аметистовый вирм [Amethyst Greatwyrm]
Великий изумрудный вирм [Emerald Greatwyrm]
Великий кристаллический вирм [Crystal Greatwyrm]
Великий сапфировый вирм [Sapphire Greatwyrm]
Великий топазный вирм [Topaz Greatwyrm]
Вельзевул [Baalzebul]
Демогоргон [Demogorgon MPMM]
Демогоргон [Demogorgon]
Древний дракон времени [Ancient Time Dragon]
Зариэль [Zariel MPMM]
Зариэль [Zariel]
Колыбель облачного отпрыска [Cradle of the Cloud Scion]
Левистус [Levistus]
Маммон [Mammon]
Нив-Миззет [Niv-Mizzet]
Оркус [Orcus]
Оркус [Orcus MPMM]
Отпрыск Мемнора [Scion of Memnor]
Тромократ [Tromokratis]
Эрцгерцогиня Авернуса Зариэль [Archduke Zariel of Avernus]
Великий белый вирм [White Greatwyrm]
Великий зелёный вирм [Green Greatwyrm]
Великий красный вирм [Red Greatwyrm]
Великий синий вирм [Blue Greatwyrm]
Великий чёрный вирм [Black Greatwyrm]
Диспатер [Dispater]
Колыбель штормового отпрыска [Cradle of the Storm Scion]
Мефистофель [Mephistopheles]
Отпрыск Стронмауса [Scion of Stronmaus]
Великий бронзовый вирм [Bronze Greatwyrm]
Великий золотой вирм [Gold Greatwyrm]
Великий латунный вирм [Brass Greatwyrm]
Великий медный вирм [Copper Greatwyrm]
Великий серебряный вирм [Silver Greatwyrm]
Рак Тулхеш [Rak Tulkhesh]
Сул Хатеш [Sul Khatesh]
Эрифламма [Eriflamme]
Асмодей [Asmodeus]
Аспект Бахамута [Aspect of Bahamut]
Аспект Тиамат [Aspect of Tiamat]
Тараск [Tarrasque]
Тиамат [Tiamat]`;
                    setMonsterList(predefinedList);
                  }}
                  disabled={isLoading}
                >
                  Вставить список
                </Button>
              </div>
              <Textarea
                placeholder={`Пример:
Белдора [Beldora]
Гелрин Фоухаммер [Ghelryn Foehammer]
Даратра Шендрел [Darathra Shendrel]`}
                value={monsterList}
                onChange={(e) => setMonsterList(e.target.value)}
                disabled={isLoading}
                rows={6}
                className="min-h-[120px]"
              />
              <Button onClick={handleListImport} disabled={isLoading || !monsterList.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Импортируем...
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    Импортировать из списка ({MonsterImportService.extractMonsterNamesFromList(monsterList).length} монстров)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Случайный импорт */}
          {importMode === 'random' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Импорт 20 случайных монстров из базы данных TTG.Club
              </p>
              <Button onClick={handleRandomImport} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Импортируем...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Импортировать случайных монстров
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Прогресс */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Загружаем монстров...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Результаты */}
          {importedMonsters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">
                  Импортировано {importedMonsters.length} монстров
                </span>
              </div>
              
              <ScrollArea className="h-40 border rounded-md p-2">
                <div className="space-y-1">
                  {importedMonsters.map((monster) => (
                    <div key={monster.id} className="flex items-center justify-between text-sm">
                      <span>{monster.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          CR {monster.challengeRating}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {monster.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Предупреждение */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Примечание:</p>
              <p>
                {importMode === 'list' ? (
                  'Импорт из списка использует локальную базу данных монстров. Монстры будут найдены по названиям и добавлены в ваш бестиарий.'
                ) : (
                  'Данные импортируются с сайта TTG.Club. Процесс может занять некоторое время. Импортированные монстры будут добавлены в ваш локальный бестиарий.'
                )}
              </p>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Закрыть
            </Button>
            {importedMonsters.length > 0 && (
              <Button 
                onClick={() => {
                  onClose();
                  setImportedMonsters([]);
                }}
              >
                Готово
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};