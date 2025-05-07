import React from 'react';

// Update the HitPointEvent type to include 'heal' as a valid type
export type HitPointEventType = 'damage' | 'healing' | 'temp' | 'tempHP' | 'death-save' | 'heal';

export interface HitPointEvent {
  type: HitPointEventType;
  value: number;
  timestamp: number;
  source?: string;
}

// Update the DamageLog component to properly handle the 'heal' event type
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DamageLogProps {
    damageLog: HitPointEvent[];
}

const DamageLog: React.FC<DamageLogProps> = ({ damageLog }) => {
    const sortedLog = [...damageLog].sort((a, b) => b.timestamp - a.timestamp);

    const getEventText = (event: HitPointEvent) => {
        switch (event.type) {
            case 'damage':
                return `Получено ${event.value} урона`;
            case 'healing':
                return `Восстановлено ${event.value} здоровья`;
            case 'temp':
                return `Получено ${event.value} временного здоровья`;
            case 'tempHP':
                return `Получено ${event.value} временных HP`;
            case 'death-save':
                return `Спасбросок от смерти: ${event.value > 0 ? 'Успех' : 'Провал'}`;
            case 'heal':
                return `Вылечено ${event.value} здоровья`;
            default:
                return 'Неизвестное событие';
        }
    };

    return (
        <Card>
            <CardContent className="p-2">
                <h3 className="text-sm font-semibold mb-2">История изменений HP</h3>
                <ScrollArea className="h-[200px] w-full">
                    <div className="flex flex-col">
                        {sortedLog.map((event, index) => (
                            <div key={index} className="py-1 px-2 border-b border-border last:border-none">
                                <p className="text-xs">{getEventText(event)}</p>
                            </div>
                        ))}
                        {sortedLog.length === 0 && (
                            <div className="py-2 px-3 text-center text-muted-foreground">
                                Нет записей об изменении здоровья.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default DamageLog;
