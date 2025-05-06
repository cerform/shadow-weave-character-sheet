
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";

interface DebugPanelProps {
  title?: string;
  data: any;
  showByDefault?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  title = "Отладочная информация", 
  data,
  showByDefault = false
}) => {
  const [isOpen, setIsOpen] = useState(showByDefault);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="bg-gray-900/40 border-gray-700 p-2">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex justify-between items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Bug size={14} />
              <span>{title}</span>
            </div>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 py-3">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48 p-2 bg-black/50 rounded text-green-400">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default DebugPanel;
