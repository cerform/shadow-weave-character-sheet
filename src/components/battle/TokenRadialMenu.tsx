import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Heart, Ghost, Settings, User, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onAction: (action: string) => void;
  tokenName: string;
}

export const TokenRadialMenu: React.FC<RadialMenuProps> = ({ 
  isOpen, 
  onClose, 
  position, 
  onAction,
  tokenName 
}) => {
  const actions = [
    { id: 'attack', icon: Sword, label: 'Атака', color: 'bg-red-500' },
    { id: 'defend', icon: Shield, label: 'Защита', color: 'bg-blue-500' },
    { id: 'heal', icon: Heart, label: 'Лечение', color: 'bg-green-500' },
    { id: 'target', icon: Target, label: 'Цель', color: 'bg-amber-500' },
    { id: 'hide', icon: Ghost, label: 'Скрыть', color: 'bg-purple-500' },
    { id: 'edit', icon: Settings, label: 'Правка', color: 'bg-slate-500' },
  ];

  const radius = 80;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] pointer-events-auto"
      onClick={onClose}
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <div 
        className="absolute"
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative flex items-center justify-center"
          >
            {/* Center Circle */}
            <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-primary/50 flex items-center justify-center shadow-2xl z-10">
              <User className="w-6 h-6 text-primary" />
            </div>

            {/* Label */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 45, opacity: 1 }}
              className="absolute whitespace-nowrap text-xs font-bold bg-black/80 px-2 py-1 rounded border border-white/20 text-white"
            >
              {tokenName}
            </motion.div>

            {/* Radial Buttons */}
            {actions.map((action, index) => {
              const angle = (index / actions.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.button
                  key={action.id}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x, y, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`absolute w-10 h-10 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-white/20 group`}
                  onClick={() => {
                    onAction(action.id);
                    onClose();
                  }}
                  title={action.label}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="absolute -top-8 bg-slate-800 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
