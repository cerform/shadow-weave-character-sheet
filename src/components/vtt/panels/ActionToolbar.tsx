import React from 'react';
import { Sword, Zap, Heart, Scroll, Target, Dice5 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socket';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ActionToolbar: React.FC = () => {
  const dice = [
    { type: 'd4', icon: '4' },
    { type: 'd6', icon: '6' },
    { type: 'd8', icon: '8' },
    { type: 'd10', icon: '10' },
    { type: 'd12', icon: '12' },
    { type: 'd20', icon: '20' },
    { type: 'd100', icon: '100' },
  ];

  const handleRoll = (type: string) => {
    socketService.rollDice(type);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-2 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
      
      {/* Dice Section */}
      <div className="flex items-center gap-1 pr-4 border-r border-white/5 mr-2">
        <TooltipProvider>
          {dice.map((die) => (
            <Tooltip key={die.type}>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => handleRoll(die.type)}
                  className="w-10 h-10 flex flex-col items-center justify-center rounded-xl hover:bg-primary/20 hover:text-primary transition-all active:scale-90 group relative"
                >
                   <Dice5 className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                   <span className="text-[10px] font-bold absolute mt-0.5">{die.icon}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-background border-border">
                <p className="text-xs">Roll {die.type}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-10 rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
          <Heart className="w-4 h-4 mr-2" />
          Heal
        </Button>
        <Button size="sm" variant="outline" className="h-10 rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <Sword className="w-4 h-4 mr-2" />
          Attack
        </Button>
        <Button size="sm" variant="outline" className="h-10 rounded-xl border-sky-500/30 text-sky-400 hover:bg-sky-500/10">
          <Scroll className="w-4 h-4 mr-2" />
          Spell
        </Button>
        <Button size="sm" variant="outline" className="h-10 rounded-xl border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
          <Target className="w-4 h-4 mr-2" />
          Ability
        </Button>
      </div>
    </div>
  );
};
