// Машина состояний для пошаговой боевой системы
import { supabase } from '@/integrations/supabase/client';
import {
  CombatState,
  CombatPhase,
  CombatEntity,
  CombatEvent,
  CombatLog,
  ReactionRequest,
  CombatAction
} from './types';
import {
  canEndTurn,
  canUseAction,
  canMove,
  calculateMovementCost,
  updateConditionDurations,
  triggersOpportunityAttack
} from './rules';

export class CombatStateMachine {
  private state: CombatState;
  private entities: Map<string, CombatEntity> = new Map();
  private pendingReactions: Map<string, ReactionRequest> = new Map();
  private eventListeners: ((event: CombatEvent) => void)[] = [];
  private logEntries: CombatLog[] = [];

  constructor(sessionId: string) {
    this.state = {
      sessionId,
      round: 0,
      turnIndex: 0,
      phase: 'idle',
      queue: [],
      heldForReaction: false,
      updatedAt: Date.now()
    };
  }

  // Подписка на события
  public addEventListener(listener: (event: CombatEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emit(event: CombatEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  // Основные методы управления боем
  public async startCombat(entities: CombatEntity[]): Promise<void> {
    // Сортируем по инициативе (по убыванию)
    const sortedEntities = [...entities].sort((a, b) => {
      if (b.initiative !== a.initiative) {
        return b.initiative - a.initiative;
      }
      // При равной инициативе - сначала игроки
      if (a.isPlayer !== b.isPlayer) {
        return a.isPlayer ? -1 : 1;
      }
      return 0;
    });

    // Сохраняем сущности
    this.entities.clear();
    sortedEntities.forEach(entity => {
      this.entities.set(entity.id, { ...entity });
    });

    // Устанавливаем начальное состояние
    this.state = {
      ...this.state,
      round: 1,
      turnIndex: 0,
      phase: 'round_start',
      queue: sortedEntities.map(e => e.id),
      activeEntityId: sortedEntities[0]?.id,
      heldForReaction: false,
      updatedAt: Date.now()
    };

    await this.saveCombatState();
    this.emit({ type: 'START_COMBAT', entities: sortedEntities });
    
    // Автоматически переходим к первому ходу
    await this.startRound();
  }

  public async endCombat(): Promise<void> {
    this.state.phase = 'idle';
    this.state.activeEntityId = undefined;
    await this.saveCombatState();
    this.emit({ type: 'END_COMBAT' });
  }

  private async startRound(): Promise<void> {
    this.state.phase = 'round_start';
    await this.saveCombatState();
    this.emit({ type: 'START_ROUND' });

    // Обновляем состояния всех сущностей в начале раунда
    for (const [id, entity] of this.entities) {
      // Сбрасываем использованные действия
      entity.actions = {
        usedAction: false,
        usedBonus: false,
        usedReaction: false,
        usedMovement: 0
      };
      
      // Восстанавливаем движение
      entity.movement.current = entity.movement.base;
      
      // Обновляем длительность условий
      entity.conditions = updateConditionDurations(entity, this.state.round);
    }

    // Переходим к первому ходу
    await this.startTurn();
  }

  private async startTurn(): Promise<void> {
    if (!this.state.activeEntityId) return;

    this.state.phase = 'turn_start';
    await this.saveCombatState();
    
    const activeEntity = this.entities.get(this.state.activeEntityId);
    if (activeEntity) {
      this.emit({ type: 'START_TURN', entityId: activeEntity.id });
      
      // Если сущность мертва или без сознания, автоматически пропускаем ход
      if (activeEntity.isDead || activeEntity.isUnconscious) {
        setTimeout(() => this.endTurn(activeEntity.id), 100);
        return;
      }

      // Переходим в фазу действий
      this.state.phase = 'action_phase';
      await this.saveCombatState();
    }
  }

  public async endTurn(entityId: string): Promise<void> {
    if (this.state.activeEntityId !== entityId) {
      console.warn('Trying to end turn for non-active entity');
      return;
    }

    if (this.state.heldForReaction) {
      console.warn('Cannot end turn while waiting for reactions');
      return;
    }

    this.state.phase = 'turn_end';
    await this.saveCombatState();
    this.emit({ type: 'END_TURN', entityId });

    // Переходим к следующему в очереди
    this.state.turnIndex = (this.state.turnIndex + 1) % this.state.queue.length;
    
    // Если прошли всю очередь - новый раунд
    if (this.state.turnIndex === 0) {
      this.state.round++;
      await this.startRound();
    } else {
      this.state.activeEntityId = this.state.queue[this.state.turnIndex];
      await this.startTurn();
    }
  }

  public async moveEntity(
    entityId: string,
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    isDifficultTerrain: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return { success: false, error: 'Entity not found' };
    }

    if (this.state.activeEntityId !== entityId) {
      return { success: false, error: 'Not your turn' };
    }

    const movementCost = calculateMovementCost(from, to, isDifficultTerrain);
    if (!canMove(entity, movementCost)) {
      return { success: false, error: 'Not enough movement' };
    }

    // Проверяем провоцированные атаки
    const threateningEnemies = triggersOpportunityAttack(
      entity,
      from,
      to,
      Array.from(this.entities.values())
    );

    if (threateningEnemies.length > 0) {
      // Приостанавливаем движение для обработки реакций
      await this.handleOpportunityAttacks(entity, threateningEnemies, from, to);
    } else {
      // Безопасное движение
      await this.executeMovement(entityId, from, to, movementCost);
    }

    return { success: true };
  }

  private async executeMovement(
    entityId: string,
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    cost: number
  ): Promise<void> {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Обновляем позицию и движение
    entity.position = { ...to };
    entity.actions.usedMovement += cost;
    entity.movement.current = Math.max(0, entity.movement.base - entity.actions.usedMovement);

    // Сохраняем в базу
    await this.updateEntityInDB(entity);
    
    this.emit({
      type: 'MOVE_ENTITY',
      entityId,
      from,
      to
    });

    this.addLogEntry({
      actor: entity.name,
      action: 'movement',
      description: `${entity.name} переместился (потрачено ${cost} футов движения)`,
      canUndo: true
    });
  }

  private async handleOpportunityAttacks(
    movingEntity: CombatEntity,
    threateningEnemies: CombatEntity[],
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number }
  ): Promise<void> {
    this.state.phase = 'reaction_phase';
    this.state.heldForReaction = true;
    await this.saveCombatState();

    // Отправляем запросы на реакции
    for (const enemy of threateningEnemies) {
      const request: ReactionRequest = {
        id: `reaction-${enemy.id}-${Date.now()}`,
        triggerEntityId: movingEntity.id,
        targetEntityId: enemy.id,
        trigger: 'movement',
        availableReactions: [this.getOpportunityAttackAction()],
        timeoutMs: 10000 // 10 секунд на принятие решения
      };

      this.pendingReactions.set(request.id, request);
      this.emit({ type: 'REQUEST_REACTION', request });

      // Автоматический таймаут
      setTimeout(() => {
        if (this.pendingReactions.has(request.id)) {
          this.resolveReaction(request.id); // без действия = пропуск
        }
      }, request.timeoutMs);
    }
  }

  public async resolveReaction(requestId: string, action?: CombatAction): Promise<void> {
    const request = this.pendingReactions.get(requestId);
    if (!request) return;

    this.emit({ type: 'RESOLVE_REACTION', requestId, action });
    this.pendingReactions.delete(requestId);

    if (action) {
      // Выполняем реакцию
      await this.executeAction(request.targetEntityId, action, request.triggerEntityId);
    }

    // Если это была последняя реакция, продолжаем движение
    if (this.pendingReactions.size === 0) {
      this.state.heldForReaction = false;
      this.state.phase = 'action_phase';
      await this.saveCombatState();
      
      // Теперь можно завершить движение
      // (здесь нужно сохранить параметры движения для восстановления)
    }
  }

  public async useAction(
    entityId: string,
    action: CombatAction,
    targetId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return { success: false, error: 'Entity not found' };
    }

    if (this.state.activeEntityId !== entityId && action.type !== 'reaction') {
      return { success: false, error: 'Not your turn' };
    }

    if (!canUseAction(entity, action.type)) {
      return { success: false, error: `Cannot use ${action.type}` };
    }

    await this.executeAction(entityId, action, targetId);
    return { success: true };
  }

  private async executeAction(
    entityId: string,
    action: CombatAction,
    targetId?: string
  ): Promise<void> {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Помечаем действие как использованное
    switch (action.type) {
      case 'action':
        entity.actions.usedAction = true;
        break;
      case 'bonus':
        entity.actions.usedBonus = true;
        break;
      case 'reaction':
        entity.actions.usedReaction = true;
        break;
    }

    // Обновляем в базе
    await this.updateEntityInDB(entity);

    this.emit({
      type: 'USE_ACTION',
      entityId,
      action
    });

    this.addLogEntry({
      actor: entity.name,
      action: action.name,
      targets: targetId ? [targetId] : undefined,
      description: `${entity.name} использует ${action.name}`,
      canUndo: true
    });
  }

  private getOpportunityAttackAction(): CombatAction {
    return {
      id: 'opportunity-attack',
      name: 'Провоцированная атака',
      type: 'reaction',
      description: 'Атака ближнего боя по цели, покидающей зону досягаемости',
      range: 5,
      damage: {
        dice: '1d8+3',
        type: 'slashing'
      }
    };
  }

  private addLogEntry(partial: Partial<CombatLog>): void {
    const entry: CombatLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      round: this.state.round,
      actor: partial.actor || 'Unknown',
      action: partial.action || 'unknown',
      description: partial.description || '',
      canUndo: partial.canUndo || false,
      ...partial
    };

    this.logEntries.push(entry);
    
    // Ограничиваем размер лога
    if (this.logEntries.length > 100) {
      this.logEntries.splice(0, this.logEntries.length - 100);
    }
  }

  // Геттеры для UI
  public getState(): CombatState {
    return { ...this.state };
  }

  public getActiveEntity(): CombatEntity | undefined {
    return this.state.activeEntityId ? 
      this.entities.get(this.state.activeEntityId) : 
      undefined;
  }

  public getAllEntities(): CombatEntity[] {
    return Array.from(this.entities.values());
  }

  public getLog(): CombatLog[] {
    return [...this.logEntries];
  }

  public canCurrentEntityEndTurn(): boolean {
    const active = this.getActiveEntity();
    return active ? canEndTurn(active) : false;
  }

  // Сохранение состояния (упрощенно - используем существующие таблицы)
  private async saveCombatState(): Promise<void> {
    // TODO: Добавить таблицу для состояния боя или использовать game_sessions
  }

  private async updateEntityInDB(entity: CombatEntity): Promise<void> {
    try {
      await supabase
        .from('battle_entities')
        .update({
          pos_x: entity.position.x,
          pos_y: entity.position.y,
          pos_z: entity.position.z,
          rot_y: entity.facing,
          hp_current: entity.hp.current,
          // TODO: сериализация остальных полей
          updated_at: new Date().toISOString()
        })
        .eq('id', entity.id);
    } catch (error) {
      console.error('Failed to update entity:', error);
    }
  }

  public async loadFromDatabase(sessionId: string): Promise<void> {
    // TODO: Реализовать загрузку из существующих таблиц
    try {
      const { data: entitiesData } = await supabase
        .from('battle_entities')
        .select('*')
        .eq('session_id', sessionId);

      if (entitiesData) {
        this.entities.clear();
        entitiesData.forEach(entityData => {
          const entity: CombatEntity = this.convertDBEntityToCombatEntity(entityData);
          this.entities.set(entity.id, entity);
        });
      }
    } catch (error) {
      console.error('Failed to load combat state:', error);
    }
  }

  private convertDBEntityToCombatEntity(dbEntity: any): CombatEntity {
    // Конвертируем данные из БД в формат CombatEntity
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      initiative: 10, // TODO: добавить в БД
      initiativeModifier: 0,
      position: {
        x: dbEntity.pos_x,
        y: dbEntity.pos_y,
        z: dbEntity.pos_z
      },
      facing: dbEntity.rot_y || 0,
      movement: {
        base: dbEntity.speed || 30,
        current: dbEntity.speed || 30,
        difficult: false
      },
      hp: {
        current: dbEntity.hp_current,
        max: dbEntity.hp_max,
        temporary: 0
      },
      ac: dbEntity.ac,
      actions: {
        usedAction: false,
        usedBonus: false,
        usedReaction: false,
        usedMovement: 0
      },
      conditions: [],
      vision: {
        range: 60,
        darkvision: 0,
        currentlyVisible: [],
        hasLineOfSight: {}
      },
      isPlayer: dbEntity.is_player_character || false,
      isDead: dbEntity.hp_current <= 0,
      isUnconscious: dbEntity.hp_current <= 0,
      isHidden: false,
      scale: dbEntity.scale || 1,
      animationState: 'idle',
      modelUrl: dbEntity.model_url
    };
  }
}