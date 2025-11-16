// Интерфейс для игроков
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { BattleEcosystem } from '../shared/BattleEcosystem';
import { CharacterSheet } from '@/components/dnd5e/CharacterSheet';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
import { 
  Users, 
  Dice6, 
  Heart, 
  Shield, 
  Sword,
  Eye,
  Clock
} from 'lucide-react';

export const PlayerView: React.FC = () => {
  const {
    tokens,
    characters,
    combatState,
    combatStarted,
    selectedTokenId,
    selectToken,
    addCombatEvent,
    settings,
  } = useUnifiedBattleStore();

  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [selectedCharacterSheet, setSelectedCharacterSheet] = useState<string | null>(null);

  // Получаем только видимые токены игроков
  const playerTokens = tokens.filter(token => 
    !token.isEnemy && token.isVisible !== false
  );

  // Получаем персонажей игроков
  const playerCharacters = characters.filter(char => 
    playerTokens.some(token => token.id === char.id)
  );

  // Текущий активный персонаж в бою
  const currentCharacter = combatState?.isActive 
    ? characters.find(c => c.id === combatState.turnOrder[combatState.currentTurnIndex]?.characterId)
    : null;

  // Ваш персонаж (выбранный)
  const myCharacter = selectedTokenId 
    ? characters.find(c => c.id === selectedTokenId)
    : playerCharacters[0];

  const handleDiceRoll = (formula: string, reason?: string) => {
    console.log('Player dice roll:', { formula, reason, playerName: 'Игрок' });
    addCombatEvent({
      actor: 'Игрок',
      action: 'dice',
      description: `Игрок бросил ${formula}: ${reason || 'Проверка'}`,
    });
  };

  const handleTokenSelect = (tokenId: string) => {
    selectToken(tokenId);
  };

  return (
    <div className="w-full h-full flex bg-background">
      {/* Левая панель - информация о персонаже */}
      <div className="w-80 border-r bg-muted/50 flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold">Игрок</h2>
              <p className="text-xs text-muted-foreground">
                {combatStarted ? 'В бою' : 'Подготовка'}
              </p>
            </div>
          </div>
        </div>

        {/* Статус боя */}
        {combatState?.isActive && (
          <div className="p-4 border-b">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Текущий бой
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Раунд:</span>
                  <Badge variant="outline">{combatState.round}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Текущий ход:</span>
                  <Badge variant={currentCharacter?.id === myCharacter?.id ? 'default' : 'secondary'}>
                    {currentCharacter?.name || 'Неизвестно'}
                  </Badge>
                </div>
                {currentCharacter?.id === myCharacter?.id && (
                  <div className="text-center p-2 bg-primary/10 rounded border">
                    <p className="font-medium text-primary">Ваш ход!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ваш персонаж */}
        {myCharacter && (
          <div className="p-4 border-b">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ваш персонаж
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="font-medium">{myCharacter.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span>
                      {settings.playerCanSeeHP 
                        ? `${myCharacter.hitPoints}/${myCharacter.maxHitPoints}`
                        : 'Скрыто'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-500" />
                    <span>AC {myCharacter.armorClass}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedCharacterSheet(myCharacter.id)}
                >
                  Открыть лист
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Список других игроков */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium mb-3">Другие игроки</h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {playerCharacters
                .filter(char => char.id !== myCharacter?.id)
                .map((character) => {
                  const token = tokens.find(t => t.id === character.id);
                  return (
                    <Card 
                      key={character.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedTokenId === character.id ? 'border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleTokenSelect(character.id)}
                    >
                      <div className="text-xs space-y-1">
                        <div className="font-medium">{String(character.name || 'Character')}</div>
                        <div className="text-muted-foreground">
                          Уровень {Number(character.level || 1)}
                        </div>
                        {token && currentCharacter?.id === character.id && (
                          <Badge variant="outline" className="text-xs">
                            Ходит
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </div>

        {/* Кнопка кубиков */}
        <div className="p-4 border-t">
          <Button
            onClick={() => setDiceModalOpen(true)}
            className="w-full flex items-center gap-2"
          >
            <Dice6 className="w-4 h-4" />
            Бросить кубики
          </Button>
        </div>
      </div>

      {/* Основная область - 3D карта */}
      <div className="flex-1 relative">
        {/* Упрощенный индикатор для игроков */}
        {combatState?.isActive && (
          <Card className="absolute top-4 right-4 z-10 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Sword className="w-4 h-4" />
                <span>Раунд {combatState.round}</span>
                {currentCharacter && (
                  <>
                    <span>•</span>
                    <span>Ходит: {currentCharacter.name}</span>
                    {currentCharacter.id === myCharacter?.id && (
                      <Badge variant="default" className="ml-2">
                        Ваш ход!
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3D Экосистема для игроков */}
        <BattleEcosystem 
          showFog={false}
          showMovement={false}
          enableCameraControls={true}
        />
      </div>

      {/* Модальные окна */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName="Игрок"
      />

      {/* Лист персонажа */}
      {selectedCharacterSheet && myCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Лист персонажа</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCharacterSheet(null)}
              >
                Закрыть
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <CharacterSheet character={myCharacter} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};