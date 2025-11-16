import React, { useMemo } from 'react';
import { EnhancedBattleToken3D } from './EnhancedBattleToken3D';
import { type EnhancedToken } from '@/stores/enhancedBattleStore';
import { sanitizeTokens } from '@/utils/tokenSanitizer';

interface TokenRenderer3DProps {
  tokens: EnhancedToken[];
}

/**
 * Обертка для рендеринга токенов с защитой от Error #185
 * Использует глобальный TokenSanitizer для глубокого клонирования и валидации
 */
export const TokenRenderer3D: React.FC<TokenRenderer3DProps> = ({ tokens }) => {
  // Стабилизируем массив с помощью глобального санитайзера
  const stableTokens = useMemo(
    () => sanitizeTokens(tokens),
    [tokens]
  );

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
