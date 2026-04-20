import React from 'react';
import { Users, Shield, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  isDM: boolean;
  isOnline: boolean;
  avatarUrl?: string;
}

interface PlayerListProps {
  players: Player[];
}

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 p-2 bg-background/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl min-w-[200px]">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-white/5 mb-1">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Party</span>
      </div>
      
      <div className="flex flex-col gap-1">
        {players.map((player) => (
          <div 
            key={player.id} 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default group"
          >
            <div className="relative">
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center border border-white/10">
                  <span className="text-xs font-medium uppercase">{player.name.substring(0, 2)}</span>
                </div>
              )}
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                player.isOnline ? "bg-emerald-500" : "bg-zinc-600"
              )} />
            </div>
            
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate flex items-center gap-1.5 text-foreground/90">
                {player.name}
                {player.isDM && <Shield className="w-3 h-3 text-amber-400 fill-amber-400/20" />}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                {player.isDM ? 'Dungeon Master' : 'Adventurer'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
