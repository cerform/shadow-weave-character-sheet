import { useBattleUIStore } from "@/stores/battleUIStore";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Download, 
  Eye, 
  EyeOff,
  Grid3X3,
  Camera,
  Gamepad2,
  Settings,
  File,
  X
} from "lucide-react";
import { useRef, useState } from "react";

export default function BattleToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraMode, setCameraMode] = useState("3D");
  const { fogEnabled, toggleFog } = useBattleUIStore();
  const { 
    showMovementGrid, 
    setShowMovementGrid,
    fogEnabled: enhancedFogEnabled,
    toggleFog: enhancedToggleFog 
  } = useEnhancedBattleStore();

  const handleFogToggle = () => {
    toggleFog();
    enhancedToggleFog();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Здесь можно добавить логику загрузки карты
        console.log('Загружена карта:', file.name);
        // Можно добавить в store для сохранения состояния карты
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearMap = () => {
    // Логика очистки карты
    console.log('Карта очищена');
  };

  const toggleCameraMode = () => {
    setCameraMode(prev => prev === "3D" ? "2D" : "3D");
  };

  return (
    <>
      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border-border shadow-xl z-50">
        <div className="flex items-center gap-4 px-6 py-3">
          {/* Map Loading Section */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Карта</Label>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8"
                onClick={handleFileUpload}
              >
                <Upload className="h-3 w-3 mr-1" />
                Загрузить
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8"
                onClick={handleClearMap}
              >
                <X className="h-3 w-3 mr-1" />
                Убрать
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Fog of War Control */}
          <div className="flex items-center gap-2">
            <Label htmlFor="fog-toggle" className="text-sm font-medium">
              Туман войны
            </Label>
            <Switch
              id="fog-toggle"
              checked={fogEnabled || enhancedFogEnabled}
              onCheckedChange={handleFogToggle}
            />
            <Badge variant={fogEnabled || enhancedFogEnabled ? "default" : "outline"}>
              {fogEnabled || enhancedFogEnabled ? "ВКЛ" : "ВЫКЛ"}
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Grid Control */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Сетка</Label>
            <Button
              size="sm"
              variant={showMovementGrid ? "default" : "outline"}
              onClick={() => setShowMovementGrid(!showMovementGrid)}
              className="h-8"
            >
              <Grid3X3 className="h-3 w-3 mr-1" />
              {showMovementGrid ? "Скрыть" : "Показать"}
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant={cameraMode === "3D" ? "default" : "outline"} 
              className="h-8"
              onClick={toggleCameraMode}
            >
              <Camera className="h-3 w-3 mr-1" />
              {cameraMode}
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}