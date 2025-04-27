
import React from 'react';

export const FeaturesTab = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Особенности и умения</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Классовые особенности</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium">Скрытая атака</h5>
              <p className="text-sm">Один раз за ход вы можете нанести дополнительный урон 1d6, если совершаете атаку с преимуществом.</p>
            </div>
            <div>
              <h5 className="font-medium">Хитрое действие</h5>
              <p className="text-sm">Вы можете использовать бонусное действие, чтобы применить действие Рывок, Отход или Засада.</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Расовые особенности</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium">Темное зрение</h5>
              <p className="text-sm">Вы можете видеть в темноте на расстоянии 60 футов.</p>
            </div>
            <div>
              <h5 className="font-medium">Эльфийская проницательность</h5>
              <p className="text-sm">Вы владеете навыком Восприятие.</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Черты</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium">Мастер легкого оружия</h5>
              <p className="text-sm">Вы получаете +1 к броскам атаки с легким оружием и можете использовать модификатор Ловкости для рукопашных атак.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
