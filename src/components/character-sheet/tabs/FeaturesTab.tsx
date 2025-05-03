
import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';

export const FeaturesTab = () => {
  const { character } = useCharacter();
  
  // Используем proficiencies вместо features и проверяем наличие свойства
  const classFeatures = character?.proficiencies?.filter(f => 
    f.includes('Дополнительная атака') || 
    f.includes('класс') || 
    f.includes('Архетип:')
  ) || [];
  
  const raceFeatures = character?.proficiencies?.filter(f => 
    f.includes('раса') || 
    f.includes('Темное зрение') || 
    f.includes('Эльфийская проницательность')
  ) || [];
  
  const otherFeatures = character?.proficiencies?.filter(f => 
    !classFeatures.includes(f) && !raceFeatures.includes(f)
  ) || [];

  // Получаем подкласс из className, если есть формат "Класс: Подкласс"
  const getSubclass = (): string | undefined => {
    if (!character?.className) return undefined;
    
    const parts = character.className.split(':');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return undefined;
  };

  const subclass = getSubclass();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Особенности и умения</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Классовые особенности</h4>
          <div className="space-y-3">
            {classFeatures.length > 0 ? (
              classFeatures.map((feature, index) => (
                <div key={index}>
                  <h5 className="font-medium">{feature}</h5>
                </div>
              ))
            ) : (
              <div>
                <h5 className="font-medium">Скрытая атака</h5>
                <p className="text-sm">Один раз за ход вы можете нанести дополнительный урон 1d6, если совершаете атаку с преимуществом.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg">
          <h4 className="font-semibold mb-2">Расовые особенности</h4>
          <div className="space-y-3">
            {raceFeatures.length > 0 ? (
              raceFeatures.map((feature, index) => (
                <div key={index}>
                  <h5 className="font-medium">{feature}</h5>
                </div>
              ))
            ) : (
              <>
                <div>
                  <h5 className="font-medium">Темное зрение</h5>
                  <p className="text-sm">Вы можете видеть в темноте на расстоянии 60 футов.</p>
                </div>
                <div>
                  <h5 className="font-medium">Эльфийская проницательность</h5>
                  <p className="text-sm">Вы владеете навыком Восприятие.</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {(otherFeatures.length > 0 || subclass) && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-semibold mb-2">Черты и другие особенности</h4>
            <div className="space-y-3">
              {subclass && (
                <div>
                  <h5 className="font-medium">Архетип: {subclass}</h5>
                </div>
              )}
              {otherFeatures.map((feature, index) => (
                <div key={index}>
                  <h5 className="font-medium">{feature}</h5>
                </div>
              ))}
              {otherFeatures.length === 0 && !subclass && (
                <div>
                  <h5 className="font-medium">Мастер легкого оружия</h5>
                  <p className="text-sm">Вы получаете +1 к броскам атаки с легким оружием и можете использовать модификатор Ловкости для рукопашных атак.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesTab;
