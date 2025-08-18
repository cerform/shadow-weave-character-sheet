import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorldStore } from "@/stores/worldStore";
import { 
  MousePointer, 
  Eraser, 
  Palette as PaletteIcon,
  RotateCw,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Layers3,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useRef } from "react";

export default function Toolbar() {
  const { 
    mode, 
    setMode, 
    activeRot, 
    rotateCW, 
    currentHeight,
    setHeight,
    undo,
    redo,
    undoAction,
    redoAction,
    exportBlueprint,
    importBlueprint,
    clear,
    bricks
  } = useWorldStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blueprint = exportBlueprint();
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const blueprint = JSON.parse(event.target?.result as string);
        importBlueprint(blueprint);
      } catch (error) {
        console.error('Ошибка при импорте блюпринта:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Card className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Режимы */}
          <div className="flex gap-1 border border-border rounded-md p-1">
            <Button
              size="sm"
              variant={mode === "place" ? "default" : "ghost"}
              onClick={() => setMode("place")}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={mode === "remove" ? "default" : "ghost"}
              onClick={() => setMode("remove")}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={mode === "paint" ? "default" : "ghost"}
              onClick={() => setMode("paint")}
            >
              <PaletteIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Поворот */}
          <Button size="sm" variant="outline" onClick={rotateCW}>
            <RotateCw className="w-4 h-4" />
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeRot}°
            </Badge>
          </Button>

          {/* Высота */}
          <div className="flex items-center gap-1 border border-border rounded-md p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHeight(Math.max(0, currentHeight - 1))}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              <Layers3 className="w-4 h-4" />
              <span className="text-sm min-w-[20px] text-center">{currentHeight}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHeight(currentHeight + 1)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={undoAction}
              disabled={undo.length === 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redoAction}
              disabled={redo.length === 0}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Файловые операции */}
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clear}
              disabled={bricks.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Скрытый input для импорта */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Подсказки по горячим клавишам */}
        <div className="mt-2 text-xs text-muted-foreground">
          <span>Q/E - поворот</span>
          <span className="mx-2">•</span>
          <span>R/F - высота</span>
          <span className="mx-2">•</span>
          <span>ЛКМ - разместить</span>
          <span className="mx-2">•</span>
          <span>ПКМ - повернуть</span>
        </div>
      </CardContent>
    </Card>
  );
}