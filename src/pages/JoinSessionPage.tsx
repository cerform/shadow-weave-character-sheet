import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCharacter } from '@/contexts/CharacterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sessionService } from '@/services/sessionService';
import { socketService } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Scroll, Users, Sword, Shield, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const JoinSessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [sessionCode, setSessionCode] = useState(initialCode.toUpperCase());
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { characters } = useCharacter();

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии и имя игрока",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      // 1. Join via Supabase (persists player to DB)
      const sessionId = await sessionService.joinSession(
        sessionCode.trim().toUpperCase(),
        playerName.trim(),
        selectedCharacterId && selectedCharacterId !== 'no-character' ? selectedCharacterId : undefined
      );

      // 2. Also join the Socket room for real-time sync
      const char = selectedCharacterId && selectedCharacterId !== 'no-character'
        ? characters.find(c => c.id === selectedCharacterId)
        : undefined;
      socketService.joinSession(
        sessionCode.trim().toUpperCase(),
        playerName.trim(),
        char as any
      );

      toast({
        title: "Вы в игре!",
        description: `Присоединились как ${playerName}`,
      });

      // 3. Navigate to unified VTT view
      navigate(`/vtt/${sessionId}`);
    } catch (error: any) {
      toast({
        title: "Ошибка присоединения",
        description: error.message || "Не удалось присоединиться к сессии",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
          
          <CardHeader className="text-center pb-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 10 }}
              className="mx-auto mb-4 bg-amber-500/10 p-3 rounded-full w-fit border border-amber-500/30"
            >
              <Scroll className="h-10 w-10 text-amber-500" />
            </motion.div>
            <CardTitle className="text-3xl font-serif tracking-tight text-white mb-2">
              Вход в Нексус
            </CardTitle>
            <p className="text-slate-400 text-sm italic">
              "Призовите своих героев и вступите в зал легенд"
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6">
              <div className="space-y-2 group">
                <Label htmlFor="sessionCode" className="text-amber-200/70 text-xs uppercase tracking-widest font-bold">
                  Магическая Печать (Код)
                </Label>
                <div className="relative">
                  <Input
                    id="sessionCode"
                    type="text"
                    placeholder="КОД-6"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="bg-black/40 border-slate-700 h-14 text-center text-2xl uppercase tracking-[0.5em] font-mono text-amber-500 focus:ring-amber-500/50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-amber-200/70 text-xs uppercase tracking-widest font-bold">
                  Имя Приключенца
                </Label>
                <div className="relative">
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Как вас зовут?"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-black/40 border-slate-700 h-12 pl-10 focus:ring-amber-500/50"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {characters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-amber-200/70 text-xs uppercase tracking-widest font-bold">
                    Выберите Лик (Герой)
                  </Label>
                  <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                    <SelectTrigger className="bg-black/40 border-slate-700 h-12">
                      <SelectValue placeholder="Привязать персонажа..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      <SelectItem value="no-character" className="focus:bg-amber-600">Без персонажа</SelectItem>
                      {characters.map((character) => (
                        <SelectItem key={character.id} value={character.id} className="focus:bg-amber-600">
                          <div className="flex items-center gap-2">
                            <Sword className="h-3 w-3 text-amber-400" />
                            <span>{character.name} ({character.class})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button 
              onClick={handleJoinSession} 
              disabled={isJoining || !sessionCode.trim() || !playerName.trim()}
              className="w-full h-14 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-900/20 border-t border-white/10"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Brain className="h-5 w-5" />
                  </motion.div>
                  Призываю...
                </div>
              ) : (
                'ВСТУПИТЬ В БОЙ'
              )}
            </Button>

            <div className="text-center pt-2">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-slate-500 hover:text-amber-500 text-xs uppercase tracking-tighter"
              >
                Вернуться к выбору пути
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all">
           <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Dungeons_%26_Dragons_5th_Edition_logo.png" className="h-8" alt="D&D 5e" />
           <p className="text-[10px] text-slate-500 uppercase flex items-center">Nexus Powered by Llama 3.1</p>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinSessionPage;
