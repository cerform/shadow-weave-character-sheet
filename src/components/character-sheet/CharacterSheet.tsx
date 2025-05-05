import React, { useState, useContext } from 'react';
import { CharacterContext, useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import NavigationButtons from "@/components/ui/NavigationButtons";
import { StatsPanel } from './StatsPanel';
import { CharacterTabs } from './CharacterTabs';
import ResourcePanel from './ResourcePanel';
import { RestPanel } from './RestPanel';
import { ThemeSelector } from './ThemeSelector';
import LevelUpPanel from './LevelUpPanel';
import { SkillsPanel } from './SkillsPanel';

interface CharacterSheetProps {
  character: Character | null;
  isDM?: boolean; 
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, isDM = false }) => {
  const { updateCharacter } = useCharacter();
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showCombatDialog, setShowCombatDialog] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [activeTab, setActiveTab] = useState("abilities");
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { joinSession } = useSession();
  const navigate = useNavigate();
  
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
    if (!character) return;
    
    updateCharacter({
      currentHp: newHp
    });
    
    toast({
      title: "Здоровье обновлено",
      description: `Текущее здоровье: ${newHp}`,
    });
  };
  
  const handleUseSpellSlot = (level: number) => {
    if (!character || !character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    updateCharacter({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Слот заклинания использован",
      description: `Использован слот ${level} уровня`,
    });
  };
  
  const handleRestoreSpellSlot = (level: number) => {
    if (!character || !character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    updateCharacter({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Слот заклинания восстановлен",
      description: `Восстановлен слот ${level} уровня`,
    });
  };

  return (
    <div 
      className="min-h-screen py-4"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
      <div className="container mx-auto py-4 px-2">
    
        <NavigationButtons className="mb-4" />
        
        <div className="flex justify-end mb-4">
          <ThemeSelector />
        </div>
      
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20 mb-4">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: currentTheme.textColor }}>
              {character ? character.name : 'Новый персонаж'}
            </CardTitle>
            <CardDescription style={{ color: currentTheme.mutedTextColor }}>
              {character ? (
                <>
                  {character.className || ''} {character.race ? `, ${character.race}` : ''} 
                  {character.level ? `, Уровень ${character.level}` : ''}
                </>
              ) : 'Создайте своего персонажа'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <Button 
                onClick={handleCharacterSave} 
                className="mr-2"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText
                }}
              >
                Сохранить
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportToPdf}
                style={{
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Экспорт в PDF
              </Button>
            </div>
            <Button 
              onClick={() => setShowSessionDialog(true)}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Присоединиться к сессии
            </Button>
          </CardContent>
        </Card>
        
        {/* Обновленная сетка с измененным расположением панелей */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
          {/* Левая панель с ресурсами вверху */}
          <div className="md:col-span-3 space-y-4">
            <ResourcePanel 
              character={character}
              onUpdate={updateCharacter}
            />
            
            <StatsPanel character={character} />
            
            <LevelUpPanel />
            
            {/* Убираем отсюда панель слотов заклинаний */}
          </div>
          
          {/* Основной контент с вкладками */}
          <div className="md:col-span-6">
            <CharacterTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              character={character}
              onUpdate={updateCharacter}
            />
          </div>
          
          {/* Правая панель с навыками */}
          <div className="md:col-span-3">
            <SkillsPanel character={character} />
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleCharacterSave} 
            className="mr-2"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Сохранить
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportToPdf}
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Экспорт в PDF
          </Button>
          {isDM && (
            <Button 
              onClick={() => setShowCombatDialog(true)} 
              className="ml-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              В бой!
            </Button>
          )}
        </div>
        
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogContent 
            className="sm:max-w-[425px] bg-card/30 backdrop-blur-sm border-primary/20"
            style={{
              backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
              borderColor: currentTheme.accent
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: currentTheme.textColor }}>
                Присоединиться к сессии
              </DialogTitle>
              <DialogDescription style={{ color: currentTheme.mutedTextColor }}>
                Введите код сессии, чтобы присоединиться к игре.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sessionCode" className="text-right" style={{ color: currentTheme.textColor }}>
                  Код сессии
                </Label>
                <Input 
                  id="sessionCode" 
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="col-span-3"
                  style={{
                    backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.5)'}`,
                    color: currentTheme.textColor,
                    borderColor: currentTheme.accent
                  }}
                />
              </div>
            </div>
            <Button 
              onClick={handleJoinSession}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Присоединиться
            </Button>
          </DialogContent>
        </Dialog>
        
        {isDM && (
          <Dialog open={showCombatDialog} onOpenChange={setShowCombatDialog}>
            <DialogContent 
              className="sm:max-w-[425px] bg-card/30 backdrop-blur-sm border-primary/20"
              style={{
                backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
                borderColor: currentTheme.accent
              }}
            >
              <DialogHeader>
                <DialogTitle style={{ color: currentTheme.textColor }}>
                  Начать бой
                </DialogTitle>
                <DialogDescription style={{ color: currentTheme.mutedTextColor }}>
                  Вы готовы к бою!
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p style={{ color: currentTheme.textColor }}>
                  Вы уверены, что хотите начать бой?
                </p>
              </div>
              <Button 
                onClick={() => {
                  toast({
                    title: "В бой!",
                    description: "Начинаем бой!",
                  });
                  setShowCombatDialog(false);
                }}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText
                }}
              >
                В бой!
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default CharacterSheet;
