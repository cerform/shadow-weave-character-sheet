import React, { useMemo } from 'react';
import { EnhancedBattleToken3D } from './EnhancedBattleToken3D';
import { type EnhancedToken } from '@/stores/enhancedBattleStore';

interface TokenRenderer3DProps {
  tokens: EnhancedToken[];
}

/**
 * Обертка для рендеринга токенов с защитой от Error #185
 * Гарантирует стабильное количество компонентов между рендерами
 */
export const TokenRenderer3D: React.FC<TokenRenderer3DProps> = ({ tokens }) => {
  // Стабилизируем массив: фильтруем и сортируем для предсказуемого порядка
  const stableTokens = useMemo(() => {
    return tokens
      .filter(token => token && token.id)
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [tokens]);

  // Используем ключи для React reconciliation
  return (
    <>
      {stableTokens.map((token) => (
        <EnhancedBattleToken3D 
          key={`token-${token.id}`} 
          token={token} 
        />
      ))}
    </>
  );
};
