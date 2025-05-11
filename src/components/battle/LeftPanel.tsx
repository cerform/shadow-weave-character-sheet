
import React from 'react';
import { Button } from '@/components/ui/button';
import { createToken } from '@/utils/tokenHelpers';
import { Token } from '@/types/battle.d';

interface LeftPanelProps {
  // Добавьте здесь нужные пропсы
  onAddToken: (token: Omit<Token, 'id'>) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ onAddToken }) => {
  const handleAddMonster = () => {
    // Создаем токен с правильными типами
    const newToken: Omit<Token, 'id'> = createToken('monster', 'Goblin', {
      img: '/assets/monsters/goblin.png',
      x: 100,
      y: 100,
      hp: 20,
      maxHp: 20,
      ac: 15,
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
      resources: {},
      visible: true,
      isVisible: true,
      size: 'medium',
    });
    
    onAddToken(newToken);
  };
  
  const handleAddBoss = () => {
    const newToken: Omit<Token, 'id'> = createToken('boss', 'Dragon', {
      img: '/assets/monsters/dragon.png',
      x: 300,
      y: 300,
      hp: 200,
      maxHp: 200,
      ac: 18,
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
      resources: {},
      visible: true,
      isVisible: true,
      size: 'large',
    });
    
    onAddToken(newToken);
  };
  
  return (
    <div className="p-4 border-r h-full">
      <h2 className="text-xl font-bold mb-4">Monster Library</h2>
      <div className="grid gap-2">
        <Button onClick={handleAddMonster}>Add Goblin</Button>
        <Button onClick={handleAddBoss}>Add Dragon</Button>
      </div>
    </div>
  );
};

export default LeftPanel;
