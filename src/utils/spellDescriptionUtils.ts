
import React from 'react';

/**
 * Безопасно обрабатывает описание заклинания для отображения
 */
export function renderSpellDescription(description: string | string[] | undefined): React.ReactNode {
  if (!description) {
    return <p>Нет описания</p>;
  }
  
  if (typeof description === 'string') {
    return <p>{description}</p>;
  }
  
  if (Array.isArray(description)) {
    return (
      <>
        {description.map((paragraph, index) => (
          <p key={index} className="mb-2">{paragraph}</p>
        ))}
      </>
    );
  }
  
  return <p>Неверный формат описания</p>;
}
