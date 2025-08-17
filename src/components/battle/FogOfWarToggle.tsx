import React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud } from 'lucide-react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogOfWarToggleProps {
  className?: string;
}

export const FogOfWarToggle: React.FC<FogOfWarToggleProps> = ({ className }) => {
  const { fogSettings, enableFog, isDM } = useFogOfWarStore();

  if (!isDM) {
    return null;
  }

  return (
    <Button
      onClick={() => enableFog(!fogSettings.enabled)}
      className={`${fogSettings.enabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} ${className}`}
      size="sm"
    >
      <Cloud className="w-4 h-4 mr-2" />
      {fogSettings.enabled ? 'Туман ВКЛ' : 'Туман ВЫКЛ'}
    </Button>
  );
};