import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, 
  RotateCcw, 
  Copy, 
  Trash2, 
  Heart, 
  Shield, 
  Zap,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onHeal?: () => void;
  onDamage?: () => void;
  onEdit?: () => void;
  onToggleVisible?: () => void;
  isVisible?: boolean;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onRotateLeft,
  onRotateRight,
  onCopy,
  onDelete,
  onHeal,
  onDamage,
  onEdit,
  onToggleVisible,
  isVisible = true
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { 
      icon: Edit3, 
      label: 'Редактировать', 
      onClick: onEdit,
      shortcut: 'E'
    },
    { 
      icon: isVisible ? EyeOff : Eye, 
      label: isVisible ? 'Скрыть' : 'Показать', 
      onClick: onToggleVisible,
      shortcut: 'V'
    },
    { type: 'separator' },
    { 
      icon: RotateCcw, 
      label: 'Повернуть влево', 
      onClick: onRotateLeft,
      shortcut: 'Q'
    },
    { 
      icon: RotateCw, 
      label: 'Повернуть вправо', 
      onClick: onRotateRight,
      shortcut: 'E'
    },
    { type: 'separator' },
    { 
      icon: Heart, 
      label: 'Лечить (+25%)', 
      onClick: onHeal,
      shortcut: 'H',
      className: 'text-green-600 hover:text-green-500'
    },
    { 
      icon: Zap, 
      label: 'Урон (-25%)', 
      onClick: onDamage,
      shortcut: 'D',
      className: 'text-red-600 hover:text-red-500'
    },
    { type: 'separator' },
    { 
      icon: Copy, 
      label: 'Копировать', 
      onClick: onCopy,
      shortcut: 'Ctrl+C'
    },
    { 
      icon: Trash2, 
      label: 'Удалить', 
      onClick: onDelete,
      shortcut: 'Del',
      className: 'text-destructive hover:text-destructive-foreground hover:bg-destructive'
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[180px]"
      style={{ 
        left: x, 
        top: y,
        transform: 'translate(-50%, 0)'
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="h-px bg-border my-1" />;
        }

        const Icon = item.icon!;
        return (
          <button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={`w-full px-3 py-2 text-left hover:bg-secondary flex items-center gap-3 text-sm transition-colors ${
              item.className || ''
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-muted-foreground">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}