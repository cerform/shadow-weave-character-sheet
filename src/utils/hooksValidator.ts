/**
 * Утилита для runtime-валидации хуков React
 * Автоматически отлавливает нарушения Rules of Hooks
 */

interface HookCallInfo {
  hookName: string;
  callStack: string;
  timestamp: number;
  componentName?: string;
}

class HooksValidator {
  private hookCalls: Map<string, HookCallInfo[]> = new Map();
  private isEnabled = process.env.NODE_ENV === 'development';

  /**
   * Валидирует вызов хука
   */
  validateHookCall(hookName: string, componentName?: string): void {
    if (!this.isEnabled) return;

    const callStack = new Error().stack || '';
    const callInfo: HookCallInfo = {
      hookName,
      callStack,
      timestamp: Date.now(),
      componentName,
    };

    // Сохраняем информацию о вызове
    const key = componentName || 'unknown';
    if (!this.hookCalls.has(key)) {
      this.hookCalls.set(key, []);
    }
    this.hookCalls.get(key)!.push(callInfo);

    // Проверяем паттерны нарушений
    this.detectViolations(callInfo);
  }

  /**
   * Обнаруживает потенциальные нарушения
   */
  private detectViolations(callInfo: HookCallInfo): void {
    const { callStack, hookName } = callInfo;

    // Проверка 1: Хук в условном блоке
    if (callStack.includes('if (') || callStack.includes('? ') || callStack.includes(': ')) {
      console.warn(
        `⚠️ POTENTIAL HOOKS VIOLATION: ${hookName} may be called conditionally`,
        callInfo
      );
    }

    // Проверка 2: Хук в цикле
    if (
      callStack.includes('.map(') ||
      callStack.includes('.forEach(') ||
      callStack.includes('for (') ||
      callStack.includes('while (')
    ) {
      console.error(
        `🔴 HOOKS VIOLATION DETECTED: ${hookName} is called inside a loop/map`,
        callInfo
      );
    }

    // Проверка 3: Хук в try-catch
    if (callStack.includes('try {') || callStack.includes('catch (')) {
      console.warn(
        `⚠️ POTENTIAL HOOKS VIOLATION: ${hookName} may be called inside try-catch`,
        callInfo
      );
    }
  }

  /**
   * Получить отчет о всех вызовах хуков
   */
  getReport(): Record<string, HookCallInfo[]> {
    const report: Record<string, HookCallInfo[]> = {};
    this.hookCalls.forEach((calls, component) => {
      report[component] = calls;
    });
    return report;
  }

  /**
   * Очистить историю
   */
  clear(): void {
    this.hookCalls.clear();
  }

  /**
   * Экспортировать отчет в консоль
   */
  printReport(): void {
    console.group('🔍 React Hooks Validation Report');
    this.hookCalls.forEach((calls, component) => {
      console.group(`Component: ${component}`);
      calls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.hookName} at ${new Date(call.timestamp).toISOString()}`);
      });
      console.groupEnd();
    });
    console.groupEnd();
  }
}

export const hooksValidator = new HooksValidator();

// Глобальный доступ для отладки
if (typeof window !== 'undefined') {
  (window as any).__HOOKS_VALIDATOR__ = hooksValidator;
}
