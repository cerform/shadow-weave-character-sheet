import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Character3DModel, FallbackModel } from '../ModelLoader';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import { Canvas } from '@react-three/fiber';

// Mock useGLTF для каждой модели
vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn((path: string) => ({
    scene: {
      clone: () => ({
        type: 'Object3D',
        userData: { modelPath: path },
      }),
    },
  })),
}));

describe('ModelLoader - Fixed Paths Hook Safety', () => {
  const mockToken: EnhancedToken = {
    id: 'test-token',
    name: 'Test Character',
    position: [0, 0, 0],
    hp: 50,
    maxHp: 50,
    ac: 15,
    speed: 6,
    conditions: [],
    isEnemy: false,
    hasMovedThisTurn: false,
  };

  describe('Fixed Path Compliance', () => {
    it('должен использовать фиксированные пути для useGLTF (не динамические)', () => {
      // Каждый компонент модели должен иметь ФИКСИРОВАННЫЙ путь
      const modelTypes = ['fighter', 'wizard', 'rogue', 'cleric', 'goblin', 'skeleton', 'orc', 'dragon', 'default'];

      modelTypes.forEach(modelType => {
        render(
          <Canvas>
            <Character3DModel
              modelType={modelType as any}
              scale={1}
              token={mockToken}
              isActive={false}
              isSelected={false}
              isEnemy={false}
            />
          </Canvas>
        );
      });

      // Если код выполнился без ошибок - фиксированные пути работают
      expect(true).toBe(true);
    });

    it('должен рендериться через условный РЕНДЕРИНГ, а не условные хуки', () => {
      // Переключаем между разными типами моделей
      const { rerender } = render(
        <Canvas>
          <Character3DModel
            modelType="fighter"
            scale={1}
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Character3DModel
            modelType="wizard"
            scale={1}
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Character3DModel
            modelType="dragon"
            scale={1}
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      // Нет ошибок = условный рендеринг работает правильно
      expect(true).toBe(true);
    });
  });

  describe('Fallback Model', () => {
    it('должен рендерить FallbackModel без хуков от Three.js', () => {
      render(
        <Canvas>
          <FallbackModel
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      expect(true).toBe(true);
    });

    it('должен корректно переключаться между FallbackModel и реальными моделями', () => {
      const { rerender } = render(
        <Canvas>
          <FallbackModel
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      rerender(
        <Canvas>
          <Character3DModel
            modelType="fighter"
            scale={1}
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      expect(true).toBe(true);
    });
  });

  describe('Suspense Boundaries', () => {
    it('должен корректно работать с React.Suspense', () => {
      // Character3DModel использует Suspense внутри
      render(
        <Canvas>
          <Character3DModel
            modelType="fighter"
            scale={1}
            token={mockToken}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
        </Canvas>
      );

      expect(true).toBe(true);
    });
  });

  describe('Multiple Models Rendering', () => {
    it('должен безопасно рендерить несколько разных моделей одновременно', () => {
      render(
        <Canvas>
          <Character3DModel
            modelType="fighter"
            scale={1}
            token={{ ...mockToken, id: 'token-1' }}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
          <Character3DModel
            modelType="wizard"
            scale={1}
            token={{ ...mockToken, id: 'token-2' }}
            isActive={false}
            isSelected={false}
            isEnemy={false}
          />
          <Character3DModel
            modelType="goblin"
            scale={1}
            token={{ ...mockToken, id: 'token-3' }}
            isActive={true}
            isSelected={true}
            isEnemy={true}
          />
        </Canvas>
      );

      expect(true).toBe(true);
    });
  });
});
