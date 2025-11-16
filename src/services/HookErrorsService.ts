// Сервис для управления ошибками хуков React
export interface HookViolation {
  id: string;
  file: string;
  line: number;
  code: string;
  type: 'map' | 'conditional' | 'nested_function' | 'switch';
  hook: string;
  timestamp: string;
  resolved: boolean;
}

const STORAGE_KEY = 'hook_violations';

export class HookErrorsService {
  // Получить все ошибки хуков
  static getAll(): HookViolation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Ошибка загрузки ошибок хуков:', error);
      return [];
    }
  }

  // Добавить новую ошибку хука
  static add(violation: Omit<HookViolation, 'id' | 'timestamp' | 'resolved'>): void {
    const violations = this.getAll();
    const newViolation: HookViolation = {
      ...violation,
      id: `${violation.file}-${violation.line}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Проверяем, не существует ли уже такая ошибка
    const exists = violations.some(
      v => v.file === newViolation.file && 
           v.line === newViolation.line && 
           v.hook === newViolation.hook
    );

    if (!exists) {
      violations.push(newViolation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(violations));
    }
  }

  // Пометить ошибку как решённую
  static resolve(id: string): void {
    const violations = this.getAll();
    const updated = violations.map(v => 
      v.id === id ? { ...v, resolved: true } : v
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // Удалить ошибку
  static delete(id: string): void {
    const violations = this.getAll().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(violations));
  }

  // Очистить все ошибки
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Получить статистику
  static getStats() {
    const violations = this.getAll();
    const unresolved = violations.filter(v => !v.resolved);

    return {
      total: violations.length,
      unresolved: unresolved.length,
      resolved: violations.length - unresolved.length,
      byType: {
        map: violations.filter(v => v.type === 'map').length,
        conditional: violations.filter(v => v.type === 'conditional').length,
        nested_function: violations.filter(v => v.type === 'nested_function').length,
        switch: violations.filter(v => v.type === 'switch').length,
      },
    };
  }
}
