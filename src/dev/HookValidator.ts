// Работает только в дев-превью
if (import.meta.env.DEV) {
  const files = import.meta.glob("/src/**/*.{ts,tsx}", { as: "raw" });

  const hookPattern = /\buse(State|Effect|Memo|Callback|Ref|Store|LayoutEffect|Reducer|Theme|Toast|Query|Mutation)\b/;
  const problems: { file: string; line: number; lineText: string; reason: string }[] = [];

  for (const [file, loader] of Object.entries(files)) {
    loader().then((content) => {
      const lines = content.split("\n");
      let inMapCallback = false;
      let mapCallbackDepth = 0;
      let inConditional = false;
      let conditionalDepth = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Пропускаем комментарии и импорты
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || 
            trimmedLine.startsWith('*') || trimmedLine.startsWith('import ')) {
          continue;
        }

        // Трекаем .map( callback начало
        if (/\.map\s*\(/.test(line)) {
          inMapCallback = true;
          mapCallbackDepth = 0;
        }

        // Трекаем глубину вложенности в map callback
        if (inMapCallback) {
          mapCallbackDepth += (line.match(/\{/g) || []).length;
          mapCallbackDepth -= (line.match(/\}/g) || []).length;
          
          // Если вышли из map callback
          if (mapCallbackDepth < 0) {
            inMapCallback = false;
            mapCallbackDepth = 0;
          }
        }

        // Трекаем условные конструкции (if внутри компонента, не на уровне функции)
        if (/\bif\s*\(/.test(line) && !trimmedLine.startsWith('if')) {
          inConditional = true;
          conditionalDepth = 0;
        }

        // Трекаем глубину вложенности в условной конструкции
        if (inConditional) {
          conditionalDepth += (line.match(/\{/g) || []).length;
          conditionalDepth -= (line.match(/\}/g) || []).length;
          
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
          
          if (!isTopLevel && !isHookDefinition) {
            let reason = '';
            if (inMapCallback) {
              reason = 'Hook внутри .map() callback';
            } else if (inConditional) {
              reason = 'Hook внутри условной конструкции';
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
        .map(([file, probs]) => `${file}: ${probs.length}`)
        .join('\n');

      console.warn(
        `🔍 HookValidator: Найдено ${problems.length} потенциальных нарушений\n\n` +
        `Топ-5 проблемных файлов:\n${topFiles}\n\n` +
        `Подробности в Console → "❌ Invalid React hook usage detected"`
      );
    } else {
      console.log('✅ HookValidator: Нарушений правил хуков не найдено!');
    }
  }, 1500);
}
