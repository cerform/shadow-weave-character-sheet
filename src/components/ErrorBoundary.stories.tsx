import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';
import React from 'react';

const ThrowError = () => {
  throw new Error('Test error for visual regression');
};

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="p-8">Normal content without errors</div>,
  },
};

export const WithError: Story = {
  args: {
    children: <ThrowError />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <ThrowError />,
    fallback: <div className="p-8 text-destructive">Custom error UI</div>,
  },
};

export const WithRetry: Story = {
  args: {
    children: <ThrowError />,
    maxRetries: 3,
    retryDelay: 1000,
  },
};
