/**
 * React Hooks Debugger - Инструмент для поиска нарушений Rules of Hooks
 * 
 * Этот инструмент помогает найти:
 * 1. Условные вызовы хуков (if/switch/try-catch)
 * 2. Хуки внутри циклов или map()
 * 3. Переменное количество хуков между рендерами
 * 4. Хуки после раннего возврата
 */

interface HookViolation {
  type: 'conditional' | 'loop' | 'early-return' | 'dynamic-count';
  severity: 'critical' | 'warning';
  file: string;
  line?: number;
  hook: string;
  context: string;
  suggestion: string;
}

export class ReactHooksDebugger {
  private violations: HookViolation[] = [];

  /**
   * Сканирует код на наличие условных хуков
   */
  static findConditionalHooks(code: string, filename: string): HookViolation[] {
    const violations: HookViolation[] = [];
    const lines = code.split('\n');

    // Паттерны хуков React
    const hookPatterns = [
      /\buse[A-Z]\w+\(/g,
      /\buseState\(/g,
      /\buseEffect\(/g,
      /\buseCallback\(/g,
      /\buseMemo\(/g,
      /\buseRef\(/g,
      /\buseContext\(/g,
    ];

    // Опасные паттерны
    const conditionalPatterns = [
      { pattern: /if\s*\([^)]+\)\s*{[^}]*use[A-Z]\w+\(/s, type: 'if' },
      { pattern: /\?\s*use[A-Z]\w+\(/g, type: 'ternary' },
      { pattern: /try\s*{[^}]*use[A-Z]\w+\(/s, type: 'try-catch' },
      { pattern: /catch\s*\([^)]*\)\s*{[^}]*use[A-Z]\w+\(/s, type: 'catch' },
      { pattern: /switch\s*\([^)]+\)\s*{[^}]*use[A-Z]\w+\(/s, type: 'switch' },
    ];

    lines.forEach((line, index) => {
      // Проверка условных хуков
      conditionalPatterns.forEach(({ pattern, type }) => {
        const match = line.match(pattern);
        if (match) {
          const hookMatch = match[0].match(/use[A-Z]\w+/);
          if (hookMatch) {
            violations.push({
              type: 'conditional',
              severity: 'critical',
              file: filename,
              line: index + 1,
              hook: hookMatch[0],
              context: `Хук ${hookMatch[0]} вызван внутри ${type}`,
              suggestion: `Переместите ${hookMatch[0]} на верхний уровень компонента, до всех условий`,
            });
          }
        }
      });

      // Проверка хуков внутри map/forEach
      if (line.includes('.map(') || line.includes('.forEach(')) {
        const nextLines = lines.slice(index, Math.min(index + 10, lines.length)).join('\n');
        hookPatterns.forEach(pattern => {
          const matches = nextLines.match(pattern);
          if (matches) {
            violations.push({
              type: 'loop',
              severity: 'critical',
              file: filename,
              line: index + 1,
              hook: matches[0],
              context: `Хук ${matches[0]} внутри map/forEach создает переменное количество хуков`,
              suggestion: 'Используйте InstancedMesh или переместите хук выше цикла',
            });
          }
        });
      }

      // Проверка ранних возвратов перед хуками
      if (line.includes('return') && !line.includes('//')) {
        const restOfCode = lines.slice(index + 1).join('\n');
        hookPatterns.forEach(pattern => {
          const matches = restOfCode.match(pattern);
          if (matches) {
            violations.push({
              type: 'early-return',
              severity: 'critical',
              file: filename,
              line: index + 1,
              hook: matches[0],
              context: `Ранний return перед хуком ${matches[0]}`,
              suggestion: 'Переместите все хуки ПЕРЕД любыми return',
            });
          }
        });
      }
    });

    return violations;
  }

  /**
   * Форматирует отчет о нарушениях
   */
  static generateReport(violations: HookViolation[]): string {
    if (violations.length === 0) {
      return '✅ Нарушений Rules of Hooks не найдено!';
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const warningViolations = violations.filter(v => v.severity === 'warning');

    let report = `\n⚠️ НАЙДЕНО НАРУШЕНИЙ: ${violations.length}\n\n`;
    
    if (criticalViolations.length > 0) {
      report += `🔴 КРИТИЧЕСКИЕ (${criticalViolations.length}):\n`;
      criticalViolations.forEach((v, i) => {
        report += `\n${i + 1}. ${v.file}:${v.line}\n`;
        report += `   Тип: ${v.type}\n`;
        report += `   Хук: ${v.hook}\n`;
        report += `   Проблема: ${v.context}\n`;
        report += `   ✨ Решение: ${v.suggestion}\n`;
      });
    }

    if (warningViolations.length > 0) {
      report += `\n⚠️ ПРЕДУПРЕЖДЕНИЯ (${warningViolations.length}):\n`;
      warningViolations.forEach((v, i) => {
        report += `\n${i + 1}. ${v.file}:${v.line}\n`;
        report += `   ${v.context}\n`;
        report += `   💡 ${v.suggestion}\n`;
      });
    }

    return report;
  }

  /**
   * Проверяет, является ли компонент проблемным
   */
  static analyzeComponent(code: string, filename: string): {
    hasViolations: boolean;
    violations: HookViolation[];
    recommendations: string[];
  } {
    const violations = this.findConditionalHooks(code, filename);
    const recommendations: string[] = [];

    // Анализ и рекомендации
    if (violations.some(v => v.type === 'conditional')) {
      recommendations.push('Все хуки должны вызываться на верхнем уровне компонента');
      recommendations.push('Используйте условный рендеринг ПОСЛЕ вызова хуков');
    }

    if (violations.some(v => v.type === 'loop')) {
      recommendations.push('Для массивов элементов используйте InstancedMesh (в 3D) или key-based рендеринг');
      recommendations.push('Оберните компоненты в React.memo() для стабильности');
    }

    if (violations.some(v => v.type === 'early-return')) {
      recommendations.push('Переместите все return null в конец компонента');
      recommendations.push('Вызывайте ВСЕ хуки до любых условных возвратов');
    }

    return {
      hasViolations: violations.length > 0,
      violations,
      recommendations,
    };
  }

  /**
   * Быстрая проверка кода на критические проблемы
   */
  static quickCheck(code: string): boolean {
    const criticalPatterns = [
      /try\s*{[^}]*use[A-Z]\w+\(/s,          // useHook внутри try
      /catch[^{]*{[^}]*use[A-Z]\w+\(/s,      // useHook внутри catch
      /if\s*\([^)]+\)\s*{[^}]*use[A-Z]\w+\(/s, // useHook внутри if
      /\.map\([^)]*=>[^}]*use[A-Z]\w+\(/s,   // useHook внутри map
    ];

    return criticalPatterns.some(pattern => pattern.test(code));
  }
}

// Экспорт для использования в консоли
if (typeof window !== 'undefined') {
  (window as any).ReactHooksDebugger = ReactHooksDebugger;
  console.log('✅ ReactHooksDebugger загружен. Используйте: ReactHooksDebugger.quickCheck(code)');
}
