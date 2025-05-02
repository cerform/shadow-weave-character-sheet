
import React from 'react';
import { Button } from "@/components/ui/button";
import { Video, VideoOff } from 'lucide-react';

interface BottomPanelProps {
  showWebcams: boolean;
  setShowWebcams: (show: boolean) => void;
  isDM?: boolean; // Added isDM prop
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  showWebcams,
  setShowWebcams,
  isDM = true // Default to true
}) => {
  return (
    <div className="flex justify-between items-center p-2 px-4">
      <div>
        {/* Left section */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowWebcams(!showWebcams)}
          className="flex items-center gap-1"
        >
          {showWebcams ? (
            <>
              <VideoOff size={16} />
              <span>Скрыть вебкамеры</span>
            </>
          ) : (
            <>
              <Video size={16} />
              <span>Показать вебкамеры</span>
            </>
          )}
        </Button>
      </div>
      
      <div>
        {/* Center section */}
        {showWebcams && (
          <div className="flex gap-2">
            {/* Placeholder for webcam feeds */}
            <div className="h-12 w-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-xs">Игрок 1</div>
            <div className="h-12 w-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-xs">Игрок 2</div>
            {isDM && <div className="h-12 w-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-xs">DM</div>}
          </div>
        )}
      </div>
      
      <div>
        {/* Right section */}
        <div className="text-sm text-muted-foreground">
          {isDM ? 'Режим DM' : 'Режим игрока'}
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
