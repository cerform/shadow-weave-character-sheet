
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Send, 
  Clock, 
  BookOpen
} from "lucide-react";

interface BottomPanelProps {
  showWebcams: boolean;
  setShowWebcams: (show: boolean) => void;
}

type ChatMessage = {
  id: number;
  sender: string;
  content: string;
  type: "player" | "dm" | "system";
  timestamp: Date;
};

const BottomPanel: React.FC<BottomPanelProps> = ({
  showWebcams,
  setShowWebcams,
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "ДМ",
      content: "Добро пожаловать в игру!",
      type: "dm",
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: "Система",
      content: "Игра началась. Бросьте инициативу для начала боя.",
      type: "system",
      timestamp: new Date(),
    },
  ]);

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: "ДМ",
      content: chatMessage,
      type: "dm",
      timestamp: new Date(),
    };

    setChatLog([...chatLog, newMessage]);
    setChatMessage("");
  };

  return (
    <div className="h-52 border-t border-border">
      <Tabs defaultValue="chat">
        <div className="flex justify-between items-center px-2 pt-1">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" /> Чат
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" /> Журнал
            </TabsTrigger>
            <TabsTrigger value="webcams" className="flex items-center">
              <Camera className="w-4 h-4 mr-1" /> Веб-камеры
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={showWebcams ? "default" : "outline"}
              onClick={() => setShowWebcams(!showWebcams)}
              className="h-7"
            >
              {showWebcams ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
            </Button>
            <Button size="sm" variant="outline" className="h-7">
              <Mic className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="h-7">
              <Clock className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <TabsContent value="chat" className="p-0">
          <div className="flex flex-col h-[calc(13rem-36px)]">
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded px-2 py-1 text-sm ${
                    msg.type === "dm"
                      ? "bg-primary/10"
                      : msg.type === "system"
                      ? "bg-muted/40 italic"
                      : "bg-muted/10"
                  }`}
                >
                  <span className="font-bold">
                    {msg.sender}:
                  </span>{" "}
                  {msg.content}
                  <span className="text-xs text-muted-foreground ml-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-2 flex">
              <Input
                placeholder="Введите сообщение..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="mr-2"
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="p-2 h-[calc(13rem-36px)] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold">Журнал событий</h3>
            <div className="text-sm space-y-1">
              <div className="border-l-2 border-primary pl-2">
                <span className="text-xs text-muted-foreground">10:45</span> Игра началась
              </div>
              <div className="border-l-2 border-primary pl-2">
                <span className="text-xs text-muted-foreground">10:47</span> Артаксис атаковал гоблина и нанёс 8 урона
              </div>
              <div className="border-l-2 border-red-500 pl-2">
                <span className="text-xs text-muted-foreground">10:48</span> Гоблин-лучник стреляет в Лейлу и промахивается (Выпало 7)
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webcams" className="p-2 h-[calc(13rem-36px)]">
          <div className="grid grid-cols-4 gap-2 h-full">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-black/50 rounded-md flex items-center justify-center relative"
              >
                <div className="text-white/70 text-xs absolute bottom-1 left-1">
                  Игрок {idx}
                </div>
                <Camera className="h-6 w-6 text-white/30" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BottomPanel;
