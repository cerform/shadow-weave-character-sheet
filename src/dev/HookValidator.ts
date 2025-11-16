// Работает только в дев-превью
if (import.meta.env.DEV) {
  const files = import.meta.glob("/src/**/*.{ts,tsx}", { as: "raw" });

  const hookPattern = /\buse(State|Effect|Memo|Callback|Ref|Store|LayoutEffect|Reducer|Theme|Toast|Query|Mutation|Frame)\b/;
  const problems: { file: string; line: number; lineText: string; reason: string }[] = [];

  for (const [file, loader] of Object.entries(files)) {
    loader().then((content) => {
      const lines = content.split("\n");
      let inMapCallback = false;
      let mapCallbackDepth = 0;
      let inConditional = false;
      let conditionalDepth = 0;
      let inComponent = false;
      let componentDepth = 0;
      let inJSXMap = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Пропускаем комментарии, импорты и пустые строки
        if (trimmedLine.startsWith('//') || 
            trimmedLine.startsWith('/*') || 
            trimmedLine.startsWith('*') ||
            trimmedLine.startsWith('import ') ||
            trimmedLine.length === 0) {
          continue;
        }

        // Определяем компоненты (функции с заглавной буквы)
        if (/^(export\s+)?(default\s+)?function\s+[A-Z]/.test(trimmedLine) ||
            /^(export\s+)?(default\s+)?const\s+[A-Z][a-zA-Z]*\s*[:=]/.test(trimmedLine)) {
          inComponent = true;
          componentDepth = 0;
        }

        // Отслеживаем вложенность компонента
        if (inComponent) {
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          componentDepth += openBraces - closeBraces;
          
          // Вышли из компонента
          if (componentDepth < 0) {
            inComponent = false;
            componentDepth = 0;
          }
        }

        // Только внутри компонентов проверяем
        if (!inComponent) continue;

        // Проверяем .map() в JSX (return statement)
        // Игнорируем .map() в инициализации useState или в callback других хуков
        const isInsideHookInit = /use(State|Memo|Callback)\s*\([^)]*\.map/.test(line);
        const isReturnStatement = trimmedLine.startsWith('return') || /\breturn\s/.test(line);
        
        // Трекаем .map( callback начало (только если не внутри инициализации хука)
        if (/\.map\s*\(/.test(line) && !isInsideHookInit && isReturnStatement) {
          inJSXMap = true;
          inMapCallback = true;
          mapCallbackDepth = 0;
        }

        // Трекаем глубину вложенности в map callback
        if (inMapCallback && inJSXMap) {
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          mapCallbackDepth += openBraces - closeBraces;
          
          // Если вышли из map callback
          if (mapCallbackDepth < 0) {
            inMapCallback = false;
            inJSXMap = false;
            mapCallbackDepth = 0;
          }
        }

        // Трекаем условные конструкции (только if внутри тела компонента)
        if (/\bif\s*\(/.test(line) && !trimmedLine.startsWith('if') && componentDepth > 0 && !isReturnStatement) {
          inConditional = true;
          conditionalDepth = 0;
        }

        // Трекаем глубину вложенности в условной конструкции
        if (inConditional) {
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          conditionalDepth += openBraces - closeBraces;
          
          if (conditionalDepth < 0) {
            inConditional = false;
            conditionalDepth = 0;
          }
        }

        // Ищем хуки
        if (hookPattern.test(line)) {
          // Игнорируем хуки на верхнем уровне компонента (стандартное использование)
          const isTopLevel = !inMapCallback && !inConditional;
          
          // Игнорируем определения кастомных хуков
          const isHookDefinition = /^(export\s+)?(function|const)\s+use[A-Z]/.test(trimmedLine);
          
          // Игнорируем импорты хуков
          const isImport = /^import/.test(trimmedLine);
          
          // Игнорируем хуки внутри инициализации других хуков (useState(() => ...), useMemo(() => ...))
          const isInsideHookCallback = /use(State|Memo|Callback|Effect)\s*\(/.test(line);
          
          if (!isTopLevel && !isHookDefinition && !isImport && !isInsideHookCallback && inJSXMap) {
            let reason = '';
            if (inMapCallback) {
              reason = '❌ Hook вызывается внутри JSX .map() - каждый рендер создаёт разное количество хуков';
            } else if (inConditional) {
              reason = '❌ Hook внутри условной конструкции - количество хуков должно быть постоянным';
            }

            problems.push({
              file: file.replace('/src/', ''),
              line: i + 1,
              lineText: trimmedLine,
              reason,
            });
          }
        }
      }
    });
  }

  // Показываем результат через overlay в браузере
  setTimeout(() => {
    if (problems.length) {
      console.group(`❌ Invalid React hook usage detected (${problems.length} нарушений)`);
      
      // Группируем по файлам
      const byFile = problems.reduce((acc, p) => {
        if (!acc[p.file]) acc[p.file] = [];
        acc[p.file].push(p);
        return acc;
      }, {} as Record<string, typeof problems>);

      Object.entries(byFile).forEach(([file, fileProblems]) => {
        console.group(`📁 ${file} (${fileProblems.length})`);
        fileProblems.forEach((p) => {
          console.log(`  Строка ${p.line}: ${p.reason}`);
          console.log(`  → ${p.lineText}`);
        });
        console.groupEnd();
      });
      
      console.groupEnd();

      // Показываем топ-5 проблемных файлов
      const topFiles = Object.entries(byFile)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .map(([file, probs]) => `  • ${file}: ${probs.length}`)
        .join('\n');

      console.warn(
        `\n🔍 HookValidator: Найдено ${problems.length} реальных нарушений правил хуков\n\n` +
        `Топ проблемных файлов:\n${topFiles}\n\n` +
        `📖 Смотрите src/dev/HOOKS_RULES.md для примеров исправлений\n` +
        `Подробности в Console → "❌ Invalid React hook usage detected"`
      );
    } else {
      console.log('✅ HookValidator: Нарушений правил хуков не найдено!');
    }
  }, 1500);
}
