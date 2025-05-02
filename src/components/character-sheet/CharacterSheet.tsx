
import React, { useState } from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import NavigationButtons from "@/components/ui/NavigationButtons";
import { StatsPanel } from './StatsPanel';
import { CharacterTabs } from './CharacterTabs';
import { ResourcePanel } from './ResourcePanel';
import { RestPanel } from './RestPanel';
import { ThemeSelector } from './ThemeSelector';

interface CharacterSheetProps {
  character: Character | null;
  isDM?: boolean; // Добавляем опциональный параметр для проверки, является ли пользователь мастером
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, isDM = false }) => {
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showCombatDialog, setShowCombatDialog] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [activeTab, setActiveTab] = useState("abilities");
  const { toast } = useToast();
  const { theme } = useTheme();
  const { joinSession } = useSession();
  const navigate = useNavigate();
  
  const bgColor = theme === "dark" ? "#1E1E1E" : "#FFFFFF";

  const handleCharacterSave = () => {
    toast({
      title: "Персонаж сохранен!",
      description: "Ваш персонаж успешно сохранен.",
    });
  };

  const handleExportToPdf = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Нет данных для экспорта.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();

    doc.text(`Character Sheet: ${character.name}`, 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Attribute', 'Value']],
      body: [
        ['Name', character.name],
        ['Class', character.className || ''],
        ['Race', character.race || ''],
        ['Level', character.level?.toString() || '1'],
        ['Experience', (character.level || 0).toString()], 
        ['Alignment', character.alignment || ''],
      ],
    });

    doc.save(`${character.name}.pdf`);
  };
  
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии.",
        variant: "destructive"
      });
      return;
    }
    
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран.",
        variant: "destructive"
      });
      return;
    }
    
    const joined = joinSession(sessionCode, { name: character.name, character });
    
    if (joined) {
      toast({
        title: "Успех",
        description: "Вы успешно присоединились к сессии.",
      });
      setShowSessionDialog(false);
      navigate('/player-session');
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сессии. Проверьте код.",
        variant: "destructive"
      });
    }
  };

  const handleHpChange = (newHp: number) => {
    // Здесь будет обновление значения HP персонажа
    toast({
      title: "Здоровье обновлено",
      description: `Текущее здоровье: ${newHp}`,
    });
  };

  return (
    <div className={`min-h-screen bg-[${bgColor}] text-${theme === "dark" ? "white" : "black"}`}>
      <div className="container mx-auto py-4 px-2">
    
        {/* Добавляем навигационные кнопки вверху страницы */}
        <NavigationButtons className="mb-4" />
        
        {/* Добавляем селектор тем */}
        <div className="flex justify-end mb-4">
          <ThemeSelector />
        </div>
      
        {/* Остальной контент */}
        <CharacterHeader 
          character={character} 
          onCharacterSave={handleCharacterSave} 
          onCharacterExport={handleExportToPdf}
          onJoinSession={() => setShowSessionDialog(true)}
        />
        
        {/* Основной интерфейс листа персонажа */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Левая колонка */}
          <div className="md:col-span-1 space-y-4">
            <StatsPanel character={character} />
            <ResourcePanel 
              currentHp={character?.currentHp || 0}
              maxHp={character?.maxHp || 0}
              onHpChange={handleHpChange}
            />
            <RestPanel />
          </div>
          
          {/* Центральная и правая колонки (на мобильном будут снизу) */}
          <div className="md:col-span-2">
            <CharacterTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleCharacterSave} className="mr-2">Сохранить</Button>
          <Button variant="outline" onClick={handleExportToPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Экспорт в PDF
          </Button>
          {/* Отображаем кнопку "В бой!" только если пользователь - Мастер Подземелий */}
          {isDM && (
            <Button onClick={() => setShowCombatDialog(true)} className="ml-2">В бой!</Button>
          )}
        </div>
        
        {/* Диалог подключения к сессии */}
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogContent className="sm:max-w-[425px] bg-card/30 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle>Присоединиться к сессии</DialogTitle>
              <DialogDescription>
                Введите код сессии, чтобы присоединиться к игре.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sessionCode" className="text-right">
                  Код сессии
                </Label>
                <Input 
                  id="sessionCode" 
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="col-span-3" 
                />
              </div>
            </div>
            <Button onClick={handleJoinSession}>
              Присоединиться
            </Button>
          </DialogContent>
        </Dialog>
        
        {/* Диалог для боя (только для Мастера) */}
        {isDM && (
          <Dialog open={showCombatDialog} onOpenChange={setShowCombatDialog}>
            <DialogContent className="sm:max-w-[425px] bg-card/30 backdrop-blur-sm border-primary/20">
              <DialogHeader>
                <DialogTitle>Начать бой</DialogTitle>
                <DialogDescription>
                  Вы готовы к бою!
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Вы уверены, что хотите начать бой?</p>
              </div>
              <Button onClick={() => {
                toast({
                  title: "В бой!",
                  description: "Начинаем бой!",
                });
                setShowCombatDialog(false);
              }}>
                В бой!
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

interface CharacterHeaderProps {
  character: Character | null;
  onCharacterSave: () => void;
  onCharacterExport: () => void;
  onJoinSession: () => void;
}

const CharacterHeader: React.FC<CharacterHeaderProps> = ({ character, onCharacterSave, onCharacterExport, onJoinSession }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>
          {character ? character.name : 'Новый персонаж'}
        </CardTitle>
        <CardDescription>
          {character ? `Класс: ${character.className || ''}, Раса: ${character.race || ''}` : 'Создайте своего персонажа'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <Button onClick={onCharacterSave} className="mr-2">Сохранить</Button>
          <Button variant="outline" onClick={onCharacterExport}>
            <FileText className="mr-2 h-4 w-4" />
            Экспорт в PDF
          </Button>
        </div>
        <Button onClick={onJoinSession}>Присоединиться к сессии</Button>
      </CardContent>
    </Card>
  );
};

export default CharacterSheet;
