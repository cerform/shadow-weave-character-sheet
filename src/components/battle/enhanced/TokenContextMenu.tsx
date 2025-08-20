import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Move, Heart, Shield, Eye, Trash2 } from 'lucide-react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { AttackDialog } from '../ui/AttackDialog';

interface ContextAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

export const TokenContextMenu: React.FC = () => {
  const {
    contextMenu,
    tokens,
    hideContextMenu,
    updateToken,
    setTokenVisibility,
    addCombatEvent,
  } = useEnhancedBattleStore();

  const token = tokens.find(t => t.id === contextMenu.tokenId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        hideContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.visible, hideContextMenu]);

  if (!contextMenu.visible || !token) return null;

  const actions: ContextAction[] = [
    {
      label: 'Заклинание',
      icon: <Zap className="w-4 h-4" />,
      onClick: () => {
        addCombatEvent({
          actor: 'DM',
          action: 'заклинание',
          target: token.name,
          description: `Заклинание на ${token.name}`,
        });
        hideContextMenu();
      },
      color: 'text-purple-400 hover:bg-purple-900/20',
    },
    {
      label: 'Переместить',
      icon: <Move className="w-4 h-4" />,
      onClick: () => {
        // TODO: Implement movement mode
        console.log('Movement mode for', token.name);
        hideContextMenu();
      },
      color: 'text-blue-400 hover:bg-blue-900/20',
    },
    {
      label: 'Лечить',
      icon: <Heart className="w-4 h-4" />,
      onClick: () => {
        const healAmount = 5;
        updateToken(token.id, {
          hp: Math.min(token.maxHp, token.hp + healAmount),
        });
        addCombatEvent({
          actor: 'DM',
          action: 'лечение',
          target: token.name,
          description: `${token.name} восстанавливает ${healAmount} HP`,
        });
        hideContextMenu();
      },
      color: 'text-green-400 hover:bg-green-900/20',
    },
    {
      label: 'Урон',
      icon: <Shield className="w-4 h-4" />,
      onClick: () => {
        const damage = 5;
        updateToken(token.id, {
          hp: Math.max(0, token.hp - damage),
        });
        addCombatEvent({
          actor: 'DM',
          action: 'урон',
          target: token.name,
          damage,
          description: `${token.name} получает ${damage} урона`,
        });
        hideContextMenu();
      },
      color: 'text-orange-400 hover:bg-orange-900/20',
    },
    {
      label: token.isVisible !== false ? 'Скрыть' : 'Показать',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        setTokenVisibility(token.id, !(token.isVisible !== false));
        hideContextMenu();
      },
      color: 'text-yellow-400 hover:bg-yellow-900/20',
    },
    {
      label: 'Удалить',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        // TODO: Implement token removal
        console.log('Remove token', token.name);
        hideContextMenu();
      },
      color: 'text-red-500 hover:bg-red-900/30',
    },
  ];

  return (
    <div
      className="context-menu fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-2 min-w-48"
      style={{
        left: Math.min(contextMenu.x, window.innerWidth - 200),
        top: Math.min(contextMenu.y, window.innerHeight - actions.length * 40),
      }}
    >
      <div className="px-3 py-2 border-b border-slate-600">
        <div className="text-sm font-medium text-slate-200">{token.name}</div>
        <div className="text-xs text-slate-400">
          HP: {token.hp}/{token.maxHp} • AC: {token.ac}
        </div>
      </div>
      
      <div className="py-1">
        {/* Атака с кубиком d20 */}
        <AttackDialog attacker={token}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-3 text-left font-normal text-red-400 hover:bg-red-900/20"
            onClick={() => {}}
          >
            <Sword className="w-4 h-4" />
            <span className="ml-2">Атаковать</span>
          </Button>
        </AttackDialog>
        
        {/* Остальные действия */}
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            disabled={action.disabled}
            className={`w-full justify-start h-8 px-3 text-left font-normal ${action.color || 'text-slate-300 hover:bg-slate-700'}`}
            onClick={action.onClick}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};