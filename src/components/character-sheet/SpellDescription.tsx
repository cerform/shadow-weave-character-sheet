
import React from 'react';

interface SpellDescriptionProps {
  description: string | undefined;
  higherLevels?: string;
  expanded: boolean;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({ 
  description, 
  higherLevels, 
  expanded 
}) => {
  if (!description) {
    return <p className="text-sm text-muted-foreground">Нет описания</p>;
  }

  if (!expanded) {
    const shortDescription = description.substring(0, 100);
    return (
      <p className="text-sm whitespace-pre-wrap">
        {shortDescription}{description.length > 100 ? '...' : ''}
      </p>
    );
  }

  return (
    <div className="text-sm">
      <p className="whitespace-pre-wrap">{description}</p>
      
      {higherLevels && (
        <div className="mt-2">
          <p className="font-medium">На больших уровнях:</p>
          <p className="whitespace-pre-wrap">{higherLevels}</p>
        </div>
      )}
    </div>
  );
};

export default SpellDescription;
