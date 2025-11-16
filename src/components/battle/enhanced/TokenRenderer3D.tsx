import React, { useMemo } from 'react';
import { EnhancedBattleToken3D } from './EnhancedBattleToken3D';
import { Model3DErrorBoundary } from './Model3DErrorBoundary';
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
    () => sanitizeTokens(tokens).filter(token => 
      token && 
      token.id && 
      Array.isArray(token.position) && 
      token.position.length === 3
    ),
    [tokens]
  );

  // Используем ключи для React reconciliation и ErrorBoundary для безопасности
  return (
    <>
      {stableTokens.map((token) => (
        <React.Suspense key={`token-${token.id}`} fallback={null}>
          <Model3DErrorBoundary token={token}>
            <EnhancedBattleToken3D token={token} />
          </Model3DErrorBoundary>
        </React.Suspense>
      ))}
    </>
  );
};
