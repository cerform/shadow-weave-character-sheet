
import React from 'react';

interface SpellDescriptionProps {
  description?: string;
  higherLevels?: string;
  expanded: boolean;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({ 
  description = '', 
  higherLevels = '', 
  expanded 
}) => {
  if (!expanded) {
    return (
      <p className="whitespace-pre-wrap">
        {description?.substring(0, 100)}
        {(description?.length || 0) > 100 ? '...' : ''}
      </p>
    );
  }
  
  return (
    <>
      <p className="whitespace-pre-wrap">{description}</p>
      {higherLevels && (
        <div className="mt-2">
          <p className="font-medium">На больших уровнях:</p>
          <p className="whitespace-pre-wrap">{higherLevels}</p>
        </div>
      )}
    </>
  );
};

export default SpellDescription;
