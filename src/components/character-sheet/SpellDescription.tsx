
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpellDescriptionProps {
  description: string;
  higherLevels?: string;
  expanded?: boolean;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({ 
  description, 
  higherLevels,
  expanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  // Если описание короткое, не нужно сворачивать
  const isShortDescription = description.length < 150 && !higherLevels;
  
  if (!description) return null;
  
  if (isShortDescription) {
    return <p className="text-sm">{description}</p>;
  }
  
  return (
    <div className="space-y-2">
      <p className="text-sm">
        {isExpanded ? description : `${description.substring(0, 150)}...`}
      </p>
      
      {isExpanded && higherLevels && (
        <p className="text-sm mt-2 italic">
          <strong>На больших уровнях:</strong> {higherLevels}
        </p>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-auto text-xs text-muted-foreground flex items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="mr-1 h-3 w-3" /> Свернуть
          </>
        ) : (
          <>
            <ChevronDown className="mr-1 h-3 w-3" /> Подробнее
          </>
        )}
      </Button>
    </div>
  );
};

export default SpellDescription;
