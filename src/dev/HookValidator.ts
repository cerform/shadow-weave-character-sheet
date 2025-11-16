// Работает только в дев-превью
if (import.meta.env.DEV) {
  const files = import.meta.glob("/src/**/*.{ts,tsx}", { as: "raw" });

  const hookPattern = /\buse(State|Effect|Memo|Callback|Ref|Store|LayoutEffect|Reducer)\b/;
  const mapPattern = /\.map\s*\(/;
  const ifPattern = /\bif\s*\(/;

  const problems: { file: string; line: number; lineText: string }[] = [];

  for (const [file, loader] of Object.entries(files)) {
    loader().then((content) => {
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        // Hooks inside map()
        if (mapPattern.test(lines[i])) {
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (hookPattern.test(lines[j])) {
              problems.push({
                file,
                line: j + 1,
                lineText: lines[j].trim(),
              });
            }
          }
        }

        // Hooks inside if() { ... }
        if (ifPattern.test(lines[i])) {
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (hookPattern.test(lines[j])) {
              problems.push({
                file,
                line: j + 1,
                lineText: lines[j].trim(),
              });
            }
          }
        }
      }
    });
  }

  // Показываем результат через overlay в браузере
  setTimeout(() => {
    if (problems.length) {
      console.group("❌ Invalid React hook usage detected");
      problems.forEach((p) => {
        console.log(`${p.file}:${p.line} → ${p.lineText}`);
      });
      console.groupEnd();

      alert(
        `Найдено нарушений хуков: ${problems.length}\n` +
          `Подробности в Console → "❌ Invalid React hook usage detected"`
      );
    }
  }, 1500);
}
