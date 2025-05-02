
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

interface CharacterSheetProps {
  character: Character | null;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showCombatDialog, setShowCombatDialog] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
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
        ['Experience', character.currentHp?.toString() || '0'],
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

  return (
    <div className={`min-h-screen bg-[${bgColor}] text-${theme === "dark" ? "white" : "black"}`}>
      <div className="container mx-auto py-4 px-2">
    
        {/* Добавляем навигационные кнопки вверху страницы */}
        <NavigationButtons className="mb-4" />
      
        {/* Остальной контент */}
        <CharacterHeader 
          character={character} 
          onCharacterSave={handleCharacterSave} 
          onCharacterExport={handleExportToPdf}
          onJoinSession={() => setShowSessionDialog(true)}
        />
        
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle>Информация о персонаже</CardTitle>
            <CardDescription>Основные данные вашего персонажа</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label>Имя</Label>
              <Input type="text" value={character?.name || ''} readOnly />
            </div>
            <div>
              <Label>Класс</Label>
              <Input type="text" value={character?.className || ''} readOnly />
            </div>
            <div>
              <Label>Раса</Label>
              <Input type="text" value={character?.race || ''} readOnly />
            </div>
            <div>
              <Label>Уровень</Label>
              <Input type="number" value={character?.level || 0} readOnly />
            </div>
            <div>
              <Label>Опыт</Label>
              <Input type="number" value={character?.experience || 0} readOnly />
            </div>
            <div>
              <Label>Мировоззрение</Label>
              <Input type="text" value={character?.alignment || ''} readOnly />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleCharacterSave} className="mr-2">Сохранить</Button>
          <Button variant="outline" onClick={handleExportToPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Экспорт в PDF
          </Button>
          <Button onClick={() => setShowCombatDialog(true)} className="ml-2">В бой!</Button>
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
        
        {/* Диалог для боя */}
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
