
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharacterSpell } from "@/types/character";
import { ChevronDown, ChevronUp } from "lucide-react";
import SpellDetailModal from "./SpellDetailModal";

interface SpellCardProps {
  spell: CharacterSpell;
  compact?: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Определяем цвет для школы магии
  const getSchoolColor = (school: string) => {
    const schoolColors: Record<string, string> = {
      'Воплощение': 'bg-red-500 border-red-500',
      'Некромантия': 'bg-purple-900 border-purple-900',
      'Преобразование': 'bg-blue-500 border-blue-500',
      'Очарование': 'bg-pink-500 border-pink-500',
      'Прорицание': 'bg-amber-500 border-amber-500',
      'Ограждение': 'bg-emerald-500 border-emerald-500',
      'Иллюзия': 'bg-indigo-500 border-indigo-500',
      'Вызов': 'bg-yellow-500 border-yellow-500'
    };
    
    return schoolColors[school] || 'bg-gray-500 border-gray-500';
  };

  // Определяем текст для уровня заклинания
  const getLevelText = (level: number) => {
    if (level === 0) return "Заговор";
    return `${level}-й уровень`;
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const openDetailModal = () => {
    setShowDetailModal(true);
  };
  
  return (
    <>
      <Card 
        className="mb-2 cursor-pointer hover:shadow-md transition-shadow border border-primary/30"
        onClick={compact ? openDetailModal : toggleExpand}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg text-white">
              {spell.name}
            </CardTitle>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                {spell.ritual && (
                  <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                    Р
                  </Badge>
                )}
                {spell.concentration && (
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                    К
                  </Badge>
                )}
              </div>
              {!compact && (
                <div className="cursor-pointer p-1 text-white">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Badge className={`${getSchoolColor(spell.school).split(' ')[0]} text-white text-xs`}>
              {spell.school}
            </Badge>
            <span>{getLevelText(spell.level)}</span>
          </div>
        </CardHeader>
        
        {!compact && isExpanded && (
          <CardContent className="py-2 px-4">
            <div className="grid grid-cols-2 gap-2 text-sm mb-3 text-white/90">
              <div>
                <span className="font-semibold">Время:</span> {spell.castingTime}
              </div>
              <div>
                <span className="font-semibold">Дистанция:</span> {spell.range}
              </div>
              <div>
                <span className="font-semibold">Компоненты:</span> {spell.components}
              </div>
              <div>
                <span className="font-semibold">Длительность:</span> {spell.duration}
              </div>
            </div>
            
            <div className="text-sm text-white/90">
              <p className="line-clamp-4">{spell.description}</p>
              <button 
                className="text-primary hover:underline mt-2 font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
              >
                Подробнее
              </button>
            </div>
          </CardContent>
        )}
      </Card>
      
      <SpellDetailModal
        spell={spell}
        isOpen={showDetailModal}
        setIsOpen={setShowDetailModal}
      />
    </>
  );
};

export default SpellCard;
