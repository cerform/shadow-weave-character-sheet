import React from 'react';

interface MysticalRuneProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  animate?: boolean;
  className?: string;
}

const MysticalRune: React.FC<MysticalRuneProps> = ({ 
  size = 'md', 
  color = 'primary', 
  animate = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };

  const animationClass = animate ? 'animate-pulse' : '';

  return (
    <svg 
      className={`${sizeClasses[size]} ${colorClasses[color]} ${animationClass} ${className}`}
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Магическая руна - пентаграмма */}
      <path d="M12 2L14.4 8.8H21.6L16.2 12.8L18.6 19.6L12 15.6L5.4 19.6L7.8 12.8L2.4 8.8H9.6L12 2Z" 
            stroke="currentColor" 
            strokeWidth="1" 
            fill="none"/>
      
      {/* Внутренние детали */}
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
};

interface RunicBorderProps {
  children: React.ReactNode;
  variant?: 'simple' | 'elaborate';
  glowColor?: 'primary' | 'secondary' | 'accent';
}

export const RunicBorder: React.FC<RunicBorderProps> = ({ 
  children, 
  variant = 'simple',
  glowColor = 'primary' 
}) => {
  return (
    <div className="relative">
      {/* Углы с рунами */}
      <div className="absolute -top-2 -left-2 z-10">
        <MysticalRune size="sm" color={glowColor} />
      </div>
      <div className="absolute -top-2 -right-2 z-10">
        <MysticalRune size="sm" color={glowColor} />
      </div>
      <div className="absolute -bottom-2 -left-2 z-10">
        <MysticalRune size="sm" color={glowColor} />
      </div>
      <div className="absolute -bottom-2 -right-2 z-10">
        <MysticalRune size="sm" color={glowColor} />
      </div>
      
      {variant === 'elaborate' && (
        <>
          {/* Дополнительные руны по краям */}
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 z-10">
            <MysticalRune size="sm" color={glowColor} animate={false} />
          </div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
            <MysticalRune size="sm" color={glowColor} animate={false} />
          </div>
          <div className="absolute left-1/2 -top-2 transform -translate-x-1/2 z-10">
            <MysticalRune size="sm" color={glowColor} animate={false} />
          </div>
          <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 z-10">
            <MysticalRune size="sm" color={glowColor} animate={false} />
          </div>
        </>
      )}
      
      {/* Содержимое */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default MysticalRune;