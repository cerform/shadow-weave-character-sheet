import type { Meta, StoryObj } from '@storybook/react';
import { Model3DErrorBoundary } from './Model3DErrorBoundary';
import React from 'react';

const ThrowError = () => {
  throw new Error('3D Model loading failed');
};

const MockToken = {
  id: 'test-token',
  name: 'Test Token',
  position: [0, 0, 0] as [number, number, number],
  hp: 10,
  maxHp: 10,
  ac: 15,
  speed: 6,
  conditions: [],
  isEnemy: false,
  hasMovedThisTurn: false,
};

const meta = {
  title: 'Battle/Model3DErrorBoundary',
  component: Model3DErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Model3DErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>3D Model Content</div>,
    token: MockToken,
  },
};

export const WithError: Story = {
  args: {
    children: <ThrowError />,
    token: MockToken,
  },
};

export const WithEnemyToken: Story = {
  args: {
    children: <ThrowError />,
    token: { ...MockToken, isEnemy: true },
  },
};

export const WithCustomColor: Story = {
  args: {
    children: <ThrowError />,
    token: { ...MockToken, color: '#3b82f6' },
  },
};
