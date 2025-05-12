import React from 'react';
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';

interface SpellDescriptionProps {
  spell: SpellData;
  isPrepared?: boolean;
  isKnown?: boolean;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({ spell, isPrepared = false, isKnown = false }) => {
  // Helper function to format spell components
  const formatComponents = () => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    
    if (components.length === 0 && spell.components) {
      return spell.components;
    }
    
    let result = components.join(', ');
    
    if (spell.material && spell.materials) {
      result += ` (${spell.materials})`;
    }
    
    return result;
  };
  
  // Helper function to format spell level and school
  const formatLevelAndSchool = () => {
    if (spell.level === 0) {
      return `Заговор ${spell.school}`;
    } else {
      return `${spell.level} уровень, ${spell.school}`;
    }
  };
  
  // Helper function to format casting time
  const formatCastingTime = () => {
    let result = spell.castingTime || '1 действие';
    if (spell.ritual) {
      result += ' (ритуал)';
    }
    return result;
  };
  
  // Helper function to format spell duration
  const formatDuration = () => {
    let result = spell.duration || 'Мгновенная';
    if (spell.concentration) {
      result = `Концентрация, до ${result}`;
    }
    return result;
  };
  
  // Helper function to format spell classes
  const formatClasses = () => {
    if (!spell.classes) return '';
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.join(', ');
    } else {
      return spell.classes;
    }
  };
  
  // Helper function to format spell description
  const formatDescription = () => {
    if (Array.isArray(spell.description)) {
      return spell.description.join('\n\n');
    } else {
      return spell.description || '';
    }
  };

  // Helper function to get higher level text
  const getHigherLevelText = () => {
    return spell.higherLevels || '';
  };
  
  return (
    <div className="space-y-4">
      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {isPrepared && <Badge variant="secondary">Подготовлено</Badge>}
        {isKnown && <Badge variant="outline">Известно</Badge>}
        {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
        {spell.concentration && <Badge variant="destructive">Концентрация</Badge>}
      </div>
      
      {/* Spell details */}
      <div className="text-sm italic">
        {formatLevelAndSchool()}
      </div>
      
      {/* Spell characteristics */}
      <div className="space-y-2 border-b pb-4">
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <span className="font-medium">Время накл.:</span>
          <span>{formatCastingTime()}</span>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <span className="font-medium">Дистанция:</span>
          <span>{spell.range || 'Касание'}</span>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <span className="font-medium">Компоненты:</span>
          <span>{formatComponents()}</span>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <span className="font-medium">Длительность:</span>
          <span>{formatDuration()}</span>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <span className="font-medium">Классы:</span>
          <span>{formatClasses()}</span>
        </div>
        
        {spell.source && (
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="font-medium">Источник:</span>
            <span>{spell.source}</span>
          </div>
        )}
      </div>
      
      {/* Spell description */}
      <div className="space-y-4 text-sm">
        <div className="whitespace-pre-wrap">{formatDescription()}</div>
        
        {/* Higher Level */}
        {getHigherLevelText() && (
          <div>
            <p className="font-bold">На более высоких уровнях:</p>
            <p>{getHigherLevelText()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellDescription;
