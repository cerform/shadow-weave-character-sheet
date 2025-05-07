
import React from 'react';
import { CharacterSpell } from '@/types/character';
import SpellCard from './SpellCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SpellListProps {
  spells: CharacterSpell[];
  isLoading?: boolean;
  compactMode?: boolean;
}

const SpellList: React.FC<SpellListProps> = ({ spells, isLoading = false, compactMode }) => {
  const isMobile = useMediaQuery("(max-width: 768px)") || compactMode;

  if (isLoading) {
    return (
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className={`${isMobile ? 'h-20' : 'h-48'} w-full rounded-md`} />
        ))}
      </div>
    );
  }

  if (spells.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Заклинания не найдены</p>
        <p className="text-sm opacity-70 mt-2">Попробуйте изменить параметры фильтрации</p>
      </div>
    );
  }

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
      {spells.map(spell => (
        <SpellCard 
          key={spell.id || `${spell.name}-${spell.level}`} 
          spell={spell}
          compactMode={compactMode}
        />
      ))}
    </div>
  );
};

export default SpellList;
