
import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const FeaturesTab = () => {
  const { character } = useCharacter();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Проверяем какое поле доступно - features или proficiencies
  const featuresList = character?.proficiencies || [];
  
  // Используем доступные особенности и распределяем по категориям
  const classFeatures = featuresList.filter(f => 
    f.includes('Дополнительная атака') || 
    f.includes('класс') || 
    f.includes('Архетип:')
  ) || [];
  
  const raceFeatures = featuresList.filter(f => 
    f.includes('раса') || 
    f.includes('Темное зрение') || 
    f.includes('Эльфийская проницательность')
  ) || [];
  
  const otherFeatures = featuresList.filter(f => 
    !classFeatures.includes(f) && !raceFeatures.includes(f)
  ) || [];

  // Получаем подкласс из className или class, если есть формат "Класс: Подкласс"
  const getSubclass = (): string | undefined => {
    // Проверяем наличие строк с соответствующими полями
    const characterClassName = character?.className || '';
    
    const parts = characterClassName.split(':');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return undefined;
  };

  const subclass = getSubclass();

  // Функция для определения иконки особенности
  const getFeatureIcon = (feature: string) => {
    if (feature.includes('атака') || feature.includes('Атака'))
      return "⚔️";
    if (feature.includes('заклинание') || feature.includes('Заклинание'))
      return "✨";
    if (feature.includes('зрение') || feature.includes('Зрение'))
      return "👁️";
    if (feature.includes('сопротивление') || feature.includes('Сопротивление'))
      return "🛡️";
    if (feature.includes('чувств') || feature.includes('Чувств'))
      return "🔮";
    return "🔹";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b border-primary/20 pb-2 mb-4">Особенности и умения</h3>
      
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center">
            <span 
              className="w-6 h-6 mr-2 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: currentTheme.accent, color: '#000' }}
            >
              C
            </span>
            Классовые особенности
          </h4>
          <div className="space-y-3 pl-8">
            {classFeatures.length > 0 ? (
              classFeatures.map((feature, index) => (
                <div key={index} className="border-b border-primary/10 pb-2 last:border-0">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">{getFeatureIcon(feature)}</span> 
                    {feature}
                  </h5>
                </div>
              ))
            ) : (
              <div className="border-b border-primary/10 pb-2">
                <h5 className="font-medium flex items-center">
                  <span className="mr-2">⚔️</span> 
                  Скрытая атака
                </h5>
                <p className="text-sm opacity-80 ml-6">Один раз за ход вы можете нанести дополнительный урон 1d6, если совершаете атаку с преимуществом.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center">
            <span 
              className="w-6 h-6 mr-2 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: currentTheme.accent, color: '#000' }}
            >
              Р
            </span>
            Расовые особенности
          </h4>
          <div className="space-y-3 pl-8">
            {raceFeatures.length > 0 ? (
              raceFeatures.map((feature, index) => (
                <div key={index} className="border-b border-primary/10 pb-2 last:border-0">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">{getFeatureIcon(feature)}</span> 
                    {feature}
                  </h5>
                </div>
              ))
            ) : (
              <>
                <div className="border-b border-primary/10 pb-2">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">👁️</span> 
                    Темное зрение
                  </h5>
                  <p className="text-sm opacity-80 ml-6">Вы можете видеть в темноте на расстоянии 60 футов.</p>
                </div>
                <div className="border-b border-primary/10 pb-2">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">🔮</span> 
                    Эльфийская проницательность
                  </h5>
                  <p className="text-sm opacity-80 ml-6">Вы владеете навыком Восприятие.</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center">
            <span 
              className="w-6 h-6 mr-2 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: currentTheme.accent, color: '#000' }}
            >
              Д
            </span>
            Черты и другие особенности
          </h4>
          <div className="space-y-3 pl-8">
            {subclass && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">⭐</span>
                    Архетип
                  </h5>
                  <Badge 
                    className="font-semibold"
                    style={{
                      backgroundColor: currentTheme.accent,
                      color: currentTheme.accent === '#8B5A2B' || currentTheme.accent === '#F59E0B' ? '#000' : '#fff'
                    }}
                  >
                    {subclass}
                  </Badge>
                </div>
              </div>
            )}
            
            {otherFeatures.length > 0 ? (
              otherFeatures.map((feature, index) => (
                <div key={index} className="border-b border-primary/10 pb-2 last:border-0">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">{getFeatureIcon(feature)}</span> 
                    {feature}
                  </h5>
                </div>
              ))
            ) : (
              !subclass && (
                <div className="border-b border-primary/10 pb-2">
                  <h5 className="font-medium flex items-center">
                    <span className="mr-2">⚔️</span> 
                    Мастер легкого оружия
                  </h5>
                  <p className="text-sm opacity-80 ml-6">Вы получаете +1 к броскам атаки с легким оружием и можете использовать модификатор Ловкости для рукопашных атак.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTab;
