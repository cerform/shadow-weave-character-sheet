import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MousePointer,
  Move,
  Circle,
  Square,
  Triangle,
  Ruler,
  Eye,
  EyeOff,
  Grid,
  Zap,
  Sword,
  Shield,
  Heart,
  Plus,
  Trash2,
  RotateCcw,
  Settings,
  Users,
  Dice6
} from 'lucide-react';

interface BattleSidebarProps {
  isDM?: boolean;
  tokens?: any[];
  onAddToken?: () => void;
  onAddAllTokens?: () => void;
  onClearTokens?: () => void;
  selectedTool?: string;
  onToolSelect?: (tool: string) => void;
}

const BattleSidebar: React.FC<BattleSidebarProps> = ({
  isDM = false,
  tokens = [],
  onAddToken,
  onAddAllTokens,
  onClearTokens,
  selectedTool = 'select',
  onToolSelect
}) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Выбрать', category: 'basic' },
    { id: 'move', icon: Move, label: 'Переместить', category: 'basic' },
    { id: 'ruler', icon: Ruler, label: 'Линейка', category: 'basic' },
    { id: 'circle', icon: Circle, label: 'Область', category: 'shapes' },
    { id: 'square', icon: Square, label: 'Прямоугольник', category: 'shapes' },
    { id: 'triangle', icon: Triangle, label: 'Конус', category: 'shapes' },
    { id: 'fog', icon: Eye, label: 'Туман войны', category: 'vision' },
    { id: 'reveal', icon: EyeOff, label: 'Открыть область', category: 'vision' },
    { id: 'grid', icon: Grid, label: 'Сетка', category: 'map' },
    { id: 'light', icon: Zap, label: 'Освещение', category: 'map' }
  ];

  const basicTools = tools.filter(t => t.category === 'basic');
  const shapeTools = tools.filter(t => t.category === 'shapes');
  const visionTools = tools.filter(t => t.category === 'vision');
  const mapTools = tools.filter(t => t.category === 'map');

  const handleToolClick = (toolId: string) => {
    onToolSelect?.(toolId);
  };

  const ToolButton = ({ tool }: { tool: typeof tools[0] }) => (
    <SidebarMenuButton
      onClick={() => handleToolClick(tool.id)}
      className={`
        h-10 w-10 p-0 flex items-center justify-center
        ${selectedTool === tool.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
        ${collapsed ? 'w-8 h-8' : ''}
      `}
      title={tool.label}
    >
      <tool.icon className={collapsed ? 'h-4 w-4' : 'h-5 w-5'} />
      {!collapsed && <span className="sr-only">{tool.label}</span>}
    </SidebarMenuButton>
  );

  return (
    <Sidebar className={`border-r ${collapsed ? 'w-16' : 'w-80'}`}>
      <SidebarHeader className="border-b p-4">
        {!collapsed && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Combat Encounter</h2>
            <p className="text-sm text-muted-foreground">
              Отслеживайте инициативу, добавляя токены к встрече
            </p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Инструменты */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Основные инструменты</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'} p-2`}>
                {basicTools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <ToolButton tool={tool} />
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Фигуры и области */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Области эффектов</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'} p-2`}>
                {shapeTools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <ToolButton tool={tool} />
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Видимость */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Видимость</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'} p-2`}>
                {visionTools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <ToolButton tool={tool} />
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Карта */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Карта</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'} p-2`}>
                {mapTools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <ToolButton tool={tool} />
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Управление токенами - только если сайдбар не свернут */}
        {!collapsed && isDM && (
          <SidebarGroup>
            <SidebarGroupLabel>Управление токенами</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-4 space-y-3">
                <Button 
                  onClick={onAddAllTokens}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  <Users className="h-4 w-4 mr-2" />
                  ADD ALL TOKENS
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={onAddToken}
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Добавить
                  </Button>
                  <Button 
                    onClick={onClearTokens}
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Очистить
                  </Button>
                </div>

                {tokens.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Токены на карте
                        <Badge variant="secondary" className="ml-2">
                          {tokens.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {tokens.map((token, index) => (
                            <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: token.color || '#3b82f6' }}
                                />
                                <span>{token.name || `Токен ${index + 1}`}</span>
                              </div>
                              {token.hp !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {token.hp}/{token.maxHp}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Быстрые действия для свернутого состояния */}
        {collapsed && isDM && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 p-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onAddToken}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    title="Добавить токен"
                  >
                    <Plus className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onAddAllTokens}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    title="Добавить всех"
                  >
                    <Users className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onClearTokens}
                    className="h-8 w-8 p-0 flex items-center justify-center"
                    title="Очистить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default BattleSidebar;