import React from 'react';
import { MapPin, Users, Sword, Image, Target, Zap, Trash2, Move } from 'lucide-react';
import { SpawnPoint } from '@/stores/fogOfWarStore';

interface MenuItem {
  icon: any;
  label: string;
  action: () => void;
  color: string;
  bgColor: string;
  disabled?: boolean;
  tooltip?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  clickedSpawn?: SpawnPoint;
  onClose: () => void;
  onAddSpawn: () => void;
  onAddToken: () => void;
  onAddAsset: () => void;
  onAddEffect: () => void;
  onAddTrap: () => void;
  onDeleteSpawn?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  visible,
  clickedSpawn,
  onClose,
  onAddSpawn,
  onAddToken,
  onAddAsset,
  onAddEffect,
  onAddTrap,
  onDeleteSpawn,
}) => {
  if (!visible) return null;

  // Меню для точки спавна
  const spawnMenuItems: MenuItem[] = clickedSpawn ? [
    {
      icon: Move,
      label: 'Переместить точку спавна',
      action: () => {}, // Перетаскивание уже реализовано
      color: 'text-blue-400 hover:text-blue-300',
      bgColor: 'hover:bg-blue-400/10',
      disabled: true,
      tooltip: 'Используйте перетаскивание мышью'
    },
    {
      icon: Trash2,
      label: 'Удалить точку спавна',
      action: onDeleteSpawn!,
      color: 'text-red-400 hover:text-red-300',
      bgColor: 'hover:bg-red-400/10'
    }
  ] : [];

  // Меню для пустого места
  const generalMenuItems: MenuItem[] = [
    {
      icon: MapPin,
      label: 'Добавить точку спавна',
      action: onAddSpawn,
      color: 'text-emerald-400 hover:text-emerald-300',
      bgColor: 'hover:bg-emerald-400/10'
    },
    {
      icon: Users,
      label: 'Добавить токен персонажа',
      action: onAddToken,
      color: 'text-blue-400 hover:text-blue-300',
      bgColor: 'hover:bg-blue-400/10'
    },
    {
      icon: Sword,
      label: 'Добавить монстра',
      action: () => {
        onAddToken();
        // TODO: открыть библиотеку монстров
      },
      color: 'text-red-400 hover:text-red-300',
      bgColor: 'hover:bg-red-400/10'
    },
    {
      icon: Image,
      label: 'Разместить ассет',
      action: onAddAsset,
      color: 'text-purple-400 hover:text-purple-300',
      bgColor: 'hover:bg-purple-400/10'
    },
    {
      icon: Zap,
      label: 'Область эффекта',
      action: onAddEffect,
      color: 'text-yellow-400 hover:text-yellow-300',
      bgColor: 'hover:bg-yellow-400/10'
    },
    {
      icon: Target,
      label: 'Ловушка',
      action: onAddTrap,
      color: 'text-orange-400 hover:text-orange-300',
      bgColor: 'hover:bg-orange-400/10'
    }
  ];

  const menuItems = clickedSpawn ? spawnMenuItems : generalMenuItems;

  return (
    <>
      {/* Overlay для закрытия меню */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      
      {/* Само меню */}
      <div
        className="fixed z-50 min-w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl"
        style={{
          left: x,
          top: y,
        }}
      >
        <div className="py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = 'disabled' in item && item.disabled;
            return (
              <button
                key={index}
                onClick={() => {
                  if (!isDisabled) {
                    item.action();
                    onClose();
                  }
                }}
                disabled={isDisabled}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                  isDisabled 
                    ? 'text-neutral-500 cursor-not-allowed' 
                    : `${item.color} ${item.bgColor}`
                }`}
                title={'tooltip' in item ? item.tooltip : undefined}
              >
                <Icon size={16} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="border-t border-neutral-700 px-4 py-2">
          <div className="text-xs text-neutral-500">
            {clickedSpawn 
              ? 'ЛКМ+перетаскивание - переместить | ПКМ - удалить'
              : 'ПКМ - контекстное меню | ЛКМ+перетаскивание - точки спавна'
            }
          </div>
        </div>
      </div>
    </>
  );
};