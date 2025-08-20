import { useBattleUIStore } from "@/stores/battleUIStore";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Download, 
  Eye, 
  EyeOff,
  Grid3X3,
  Camera,
  Gamepad2,
  Settings
} from "lucide-react";

export default function BattleToolbar() {
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

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border-border shadow-xl z-50">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Map Loading Section */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Карта</Label>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8">
              <Upload className="h-3 w-3 mr-1" />
              Загрузить
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Download className="h-3 w-3 mr-1" />
              Сменить
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
          <Button size="sm" variant="outline" className="h-8">
            <Camera className="h-3 w-3 mr-1" />
            Камера
          </Button>
          <Button size="sm" variant="outline" className="h-8">
            <Gamepad2 className="h-3 w-3 mr-1" />
            Режим
          </Button>
          <Button size="sm" variant="outline" className="h-8">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}