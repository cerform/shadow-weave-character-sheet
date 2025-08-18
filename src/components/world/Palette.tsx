import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorldStore, type BrickType } from "@/stores/worldStore";
import { 
  Layers, 
  Square, 
  MoveUp, 
  Building, 
  Home, 
  Package 
} from "lucide-react";

const brickTypes: Array<{ type: BrickType; icon: any; label: string; color: string }> = [
  { type: "floor", icon: Layers, label: "Пол", color: "#6b7280" },
  { type: "wall", icon: Square, label: "Стена", color: "#8b7355" },
  { type: "stairs", icon: MoveUp, label: "Лестница", color: "#7c6f5f" },
  { type: "pillar", icon: Building, label: "Столб", color: "#5a4a3a" },
  { type: "roof", icon: Home, label: "Крыша", color: "#8b4513" },
  { type: "prop", icon: Package, label: "Декор", color: "#4ade80" },
];

export default function Palette() {
  const { activeType, setType, mode, bricks } = useWorldStore();

  return (
    <Card className="absolute top-4 right-4 w-64 bg-background/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="w-4 h-4" />
          Палитра блоков
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {brickTypes.map(({ type, icon: Icon, label, color }) => {
          const count = bricks.filter(b => b.t === type).length;
          const isActive = activeType === type;
          
          return (
            <Button
              key={type}
              variant={isActive ? "default" : "outline"}
              className="w-full justify-start gap-3 h-auto p-3"
              onClick={() => setType(type)}
              disabled={mode !== "place"}
            >
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: color }}
              />
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              {count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
        
        <div className="pt-2 border-t border-border text-xs text-muted-foreground">
          Всего блоков: {bricks.length}
        </div>
      </CardContent>
    </Card>
  );
}