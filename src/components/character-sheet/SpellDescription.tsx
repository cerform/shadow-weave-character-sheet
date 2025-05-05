
import React from 'react';

interface SpellDescriptionProps {
  description: string;
  higherLevels?: string;
  expanded: boolean;
}

const SpellDescription = ({ description, higherLevels, expanded }: SpellDescriptionProps) => {
  // If the spell description is not expanded, show only the first 100 characters
  const shortDesc = description ? `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}` : '';
  
  return (
    <div className="text-sm">
      {expanded ? (
        <>
          <p className="whitespace-pre-wrap">{description}</p>
          {higherLevels && (
            <div className="mt-2">
              <p className="font-medium">На больших уровнях:</p>
              <p className="whitespace-pre-wrap">{higherLevels}</p>
            </div>
          )}
        </>
      ) : (
        <p className="whitespace-pre-wrap">{shortDesc}</p>
      )}
    </div>
  );
};

export default SpellDescription;
