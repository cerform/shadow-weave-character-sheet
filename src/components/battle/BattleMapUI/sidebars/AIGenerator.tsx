import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wand2, Loader2, Image as ImageIcon, Map as MapIcon, Brain, Settings, Scroll, Shield, Ghost, Sword } from 'lucide-react';
import { socketService } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIGeneratorProps {
  sessionId: string;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ sessionId }) => {
  const { toast } = useToast();
  const [mapPrompt, setMapPrompt] = useState('');
  const [tokenPrompt, setTokenPrompt] = useState('');
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [currentModel, setCurrentModel] = useState<'openai' | 'groq'>('openai');

  const handleGenerateMap = async () => {
    if (!mapPrompt.trim()) return;
    setIsGeneratingMap(true);
    
    try {
      const socket = socketService.getSocket();
      socket?.emit('ai:generate_map', { sessionId, prompt: mapPrompt });
      
      toast({
        title: "Генерация запущена",
        description: "ИИ начал рисовать вашу карту. Это займет около 15-20 секунд.",
      });
      
      setTimeout(() => setIsGeneratingMap(false), 20000);
      
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на генерацию",
        variant: "destructive"
      });
      setIsGeneratingMap(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!tokenPrompt.trim()) return;
    setIsGeneratingToken(true);
    
    try {
      const socket = socketService.getSocket();
      socket?.emit('ai:generate_token', { sessionId, prompt: tokenPrompt });
      
      toast({
        title: "Генерация токена",
        description: "ИИ создает аватар персонажа...",
      });
      
      setTimeout(() => setIsGeneratingToken(false), 15000);
      
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать токен",
        variant: "destructive"
      });
      setIsGeneratingToken(false);
    }
  };

  const setPersonality = (type: string) => {
    const socket = socketService.getSocket();
    socket?.emit('ai:set_personality', type);
    toast({
      title: "Характер изменен",
      description: `ИИ теперь действует как: ${type}`,
    });
  };

  const setModel = (type: 'openai' | 'groq') => {
    const socket = socketService.getSocket();
    socket?.emit('ai:set_model', type);
    setCurrentModel(type);
    toast({
      title: "Модель изменена",
      description: `ИИ переключен на: ${type === 'groq' ? 'Llama 3.1' : 'GPT-4o'}`,
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-sm flex items-center justify-between text-primary font-bold">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Нексус
          </div>
          <Brain className="h-4 w-4 opacity-50" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-8">
            <TabsTrigger value="generate" className="text-[10px] uppercase">Создание</TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] uppercase">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="p-4 space-y-4 mt-0">
            {/* Генерация карты */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Карта Сражения</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Заснеженный лес, алтарь..." 
                  value={mapPrompt}
                  onChange={(e) => setMapPrompt(e.target.value)}
                  className="text-xs h-8 bg-black/20"
                  disabled={isGeneratingMap}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateMap}
                  disabled={isGeneratingMap}
                  className="h-8 w-8 p-0 border-primary/30 hover:border-primary"
                >
                  {isGeneratingMap ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapIcon className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Генерация токена */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Аватар Героя</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Паладин в золотых латах..." 
                  value={tokenPrompt}
                  onChange={(e) => setTokenPrompt(e.target.value)}
                  className="text-xs h-8 bg-black/20"
                  disabled={isGeneratingToken}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className="h-8 w-8 p-0 border-primary/30 hover:border-primary"
                >
                  {isGeneratingToken ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-4 mt-0">
             <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Интеллект (LLM)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={currentModel === 'openai' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-7 text-[10px]"
                    onClick={() => setModel('openai')}
                  >
                    GPT-4o Mini
                  </Button>
                  <Button 
                    variant={currentModel === 'groq' ? 'default' : 'outline'} 
                    size="sm" 
                    className="h-7 text-[10px]"
                    onClick={() => setModel('groq')}
                  >
                    Llama 3.1
                  </Button>
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Характер Мастера</Label>
                <div className="grid grid-cols-4 gap-1">
                  <Button variant="outline" size="sm" className="h-8 p-0" title="Эпический" onClick={() => setPersonality('epic')}>
                    <Label className="text-amber-500"><Scroll className="h-4 w-4" /></Label>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 p-0" title="Беспощадный" onClick={() => setPersonality('merciless')}>
                    <Label className="text-red-500"><Sword className="h-4 w-4" /></Label>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 p-0" title="Законик" onClick={() => setPersonality('rules')}>
                    <Label className="text-blue-500"><Shield className="h-4 w-4" /></Label>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 p-0" title="Тень" onClick={() => setPersonality('dark')}>
                    <Label className="text-slate-400"><Ghost className="h-4 w-4" /></Label>
                  </Button>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
