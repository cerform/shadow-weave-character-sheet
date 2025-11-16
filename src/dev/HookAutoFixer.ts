/**
 * Автоматический фиксер нарушений правил React Hooks
 * Анализирует код и предлагает/применяет исправления
 */

export interface HookViolation {
  file: string;
  line: number;
  hookName: string;
  violationType: 'map-callback' | 'conditional' | 'loop';
  context: string;
  suggestion: string;
}

export class HookAutoFixer {
  private violations: HookViolation[] = [];

  /**
   * Анализирует код и находит нарушения правил хуков
   */
  analyzeCode(filePath: string, content: string): HookViolation[] {
    const violations: HookViolation[] = [];
    const lines = content.split('\n');
    
    let depth = 0;
    let inComponent = false;
    let componentStartLine = 0;
    let inMapCallback = false;
    let mapDepth = 0;
    let inConditional = false;
    let conditionalDepth = 0;
    
    const hookPattern = /\buse(State|Effect|Memo|Callback|Ref|Reducer|Context|LayoutEffect|ImperativeHandle|DebugValue|Id|Transition|DeferredValue)\b/;
    const componentPattern = /^(export\s+)?(default\s+)?function\s+[A-Z]|^(export\s+)?(default\s+)?const\s+[A-Z][a-zA-Z]*\s*[:=]/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Пропускаем комментарии и импорты
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || 
          trimmed.startsWith('*') || trimmed.startsWith('import ') ||
          trimmed.length === 0) {
        continue;
      }

      // Определяем начало компонента
      if (componentPattern.test(trimmed)) {
        inComponent = true;
        componentStartLine = i;
        depth = 0;
      }

      // Отслеживаем глубину вложенности
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      depth += openBraces - closeBraces;

      // Конец компонента
      if (inComponent && depth <= 0 && i > componentStartLine + 5) {
        inComponent = false;
      }

      if (!inComponent) continue;

      // Проверяем .map() callbacks
      if (/\.map\s*\(/.test(line) && !/\/\//.test(line.split('.map')[0])) {
        inMapCallback = true;
        mapDepth = 0;
      }

      if (inMapCallback) {
        mapDepth += openBraces - closeBraces;
        
        // Проверяем хуки внутри map
        if (hookPattern.test(line)) {
          const match = line.match(hookPattern);
          if (match) {
            violations.push({
              file: filePath,
              line: i + 1,
              hookName: match[0],
              violationType: 'map-callback',
              context: trimmed,
              suggestion: this.generateMapFix(match[0], trimmed)
            });
          }
        }
        
        if (mapDepth < 0) {
          inMapCallback = false;
        }
      }

      // Проверяем условные конструкции
      if (/\bif\s*\(/.test(line) && !trimmed.startsWith('if')) {
        inConditional = true;
        conditionalDepth = 0;
      }

      if (inConditional) {
        conditionalDepth += openBraces - closeBraces;
        
        // Проверяем хуки внутри условий
        if (hookPattern.test(line) && !/^(export\s+)?function\s+use[A-Z]/.test(trimmed)) {
          const match = line.match(hookPattern);
          if (match) {
            violations.push({
              file: filePath,
              line: i + 1,
              hookName: match[0],
              violationType: 'conditional',
              context: trimmed,
              suggestion: this.generateConditionalFix(match[0], trimmed)
            });
          }
        }
        
        if (conditionalDepth < 0) {
          inConditional = false;
        }
      }
    }

    this.violations.push(...violations);
    return violations;
  }

  /**
   * Генерирует исправление для хука внутри .map()
   */
  private generateMapFix(hookName: string, context: string): string {
    if (hookName === 'useState') {
      return `Вынести состояние на уровень компонента используя Record или Map:\n` +
             `const [itemStates, setItemStates] = useState<Record<string, StateType>>({});\n` +
             `// В map: itemStates[item.id]`;
    }
    if (hookName === 'useEffect') {
      return `Создать отдельный компонент для элемента списка с собственным useEffect`;
    }
    if (hookName === 'useMemo' || hookName === 'useCallback') {
      return `Вынести ${hookName} на уровень компонента и передать зависимости`;
    }
    return `Рефакторить код: вынести ${hookName} на верхний уровень компонента`;
  }

  /**
   * Генерирует исправление для хука внутри условной конструкции
   */
  private generateConditionalFix(hookName: string, context: string): string {
    if (hookName === 'useState') {
      return `Вызвать ${hookName} безусловно, управлять значением через условие:\n` +
             `const [state, setState] = useState(initialValue);\n` +
             `// Использовать: condition ? state : defaultValue`;
    }
    if (hookName === 'useEffect') {
      return `Переместить условие внутрь ${hookName}:\n` +
             `useEffect(() => {\n  if (condition) {\n    // code\n  }\n}, [condition]);`;
    }
    return `Вызвать ${hookName} безусловно, управлять логикой через параметры`;
  }

  /**
   * Применяет автоматические исправления (где возможно)
   */
  applyAutoFixes(content: string, violations: HookViolation[]): string {
    // Пока просто возвращаем оригинал - реальное применение требует AST парсинга
    console.log('Автоматическое исправление требует дополнительной реализации');
    return content;
  }

  /**
   * Генерирует отчет о нарушениях
   */
  generateReport(): string {
    if (this.violations.length === 0) {
      return '✅ Нарушений правил хуков не найдено!';
    }

    const byFile = this.violations.reduce((acc, v) => {
      if (!acc[v.file]) acc[v.file] = [];
      acc[v.file].push(v);
      return acc;
    }, {} as Record<string, HookViolation[]>);

    let report = `❌ Найдено ${this.violations.length} нарушений правил хуков\n\n`;
    
    Object.entries(byFile).forEach(([file, fileViolations]) => {
      report += `📁 ${file} (${fileViolations.length} нарушений)\n`;
      fileViolations.forEach(v => {
        report += `  Строка ${v.line}: ${v.hookName} внутри ${v.violationType}\n`;
        report += `  → ${v.context}\n`;
        report += `  💡 ${v.suggestion}\n\n`;
      });
    });

    return report;
  }

  /**
   * Очищает список нарушений
   */
  clear() {
    this.violations = [];
  }

  /**
   * Возвращает все найденные нарушения
   */
  getViolations(): HookViolation[] {
    return [...this.violations];
  }
}

// Экспортируем singleton
export const hookAutoFixer = new HookAutoFixer();
