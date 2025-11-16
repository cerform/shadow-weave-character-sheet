import React from 'react';
import { type EnhancedToken } from '@/stores/enhancedBattleStore';

interface Model3DErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  token?: EnhancedToken;
}

interface Model3DErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary для 3D моделей
 * Предотвращает краш всего приложения при ошибках загрузки моделей
 */
export class Model3DErrorBoundary extends React.Component<
  Model3DErrorBoundaryProps,
  Model3DErrorBoundaryState
> {
  constructor(props: Model3DErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Model3DErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Model loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Используем fallback или простую геометрию
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback к цилиндру
      const token = this.props.token;
      if (!token) return null;

      const isEnemy = token.isEnemy || false;
      const tokenColor = token.color || (isEnemy ? "#ef4444" : "#22c55e");

      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.2]} />
          <meshStandardMaterial color={tokenColor} />
        </mesh>
      );
    }

    return this.props.children;
  }
}
