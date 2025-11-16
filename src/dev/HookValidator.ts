// src/dev/HookValidator.ts
// Полный улучшенный валидатор хуков для Lovable + Vite
// Анализирует исходные файлы через Vite dev server

import { HookErrorsService } from '@/services/HookErrorsService';

async function startHookValidator() {
  const forbidden = ["useState", "useEffect", "useMemo", "useCallback", "useRef", "useReducer"];

  const validateFile = async (path: string) => {
    try {
      const res = await fetch(path);
      if (!res.ok) return;

      const text = await res.text();
      const lines = text.split("\n");
      const violations: { line: number; text: string; type: string }[] = [];

      lines.forEach((line, i) => {
        const lineNum = i + 1;

        // Hook inside map()
        if (line.includes(".map(")) {
          for (const hook of forbidden) {
            if (lines[i + 1]?.includes(hook)) {
              violations.push({
                line: lineNum + 1,
                text: lines[i + 1].trim(),
                type: "Hook inside .map()",
              });
            }
          }
        }

        // Hook inside if / ternary
        if (line.match(/if\s*\(|\?|\:\s*</)) {
          for (const hook of forbidden) {
            if (lines[i + 1]?.includes(hook)) {
              violations.push({
                line: lineNum + 1,
                text: lines[i + 1].trim(),
                type: "Hook inside conditional",
              });
            }
          }
        }

        // Hook inside function inside render
        if (line.includes("function") || line.includes("=>")) {
          for (const hook of forbidden) {
            if (lines[i + 1]?.includes(hook)) {
              violations.push({
                line: lineNum + 1,
                text: lines[i + 1].trim(),
                type: "Hook inside nested function",
              });
            }
          }
        }
      });

      if (violations.length > 0) {
        console.groupCollapsed(
          `%c❌ HOOK VIOLATION in ${path}`,
          "color: red; font-size: 14px;"
        );
        for (const v of violations) {
          console.log(
            `%c${v.type} → line ${v.line}:\n   ${v.text}`,
            "color: orange"
          );
          
          // Определяем тип нарушения и хук
          const hookMatch = v.text.match(/(useState|useEffect|useMemo|useCallback|useRef|useReducer)/);
          const hook = hookMatch ? hookMatch[1] : 'unknown';
          
          let violationType: 'map' | 'conditional' | 'nested_function' | 'switch' = 'nested_function';
          if (v.type.includes('.map()')) violationType = 'map';
          else if (v.type.includes('conditional')) violationType = 'conditional';
          else if (v.type.includes('switch')) violationType = 'switch';
          
          // Сохраняем ошибку в сервис
          HookErrorsService.add({
            file: path,
            line: v.line,
            code: v.text,
            type: violationType,
            hook: hook,
          });
        }
        console.groupEnd();
      }
    } catch (err) {
      console.warn("Validator error:", err);
    }
  };

  // Автосканирование всех модулей из Vite
  const modules = Object.keys(import.meta.glob("/src/**/*.{ts,tsx}", { eager: false }));

  console.log(
    `%c🔍 HookValidator: scanning ${modules.length} project files...`,
    "color: #88f; font-size: 16px;"
  );

  modules.forEach(validateFile);

  console.log(
    "%c✔ HookValidator initialized",
    "color: lightgreen; font-size: 14px;"
  );
}

// Автозапуск при импорте (только в dev-режиме)
// ОТКЛЮЧЕНО: используем ESLint с eslint-plugin-react-hooks для профессиональной валидации
// if (import.meta.env.DEV) {
//   startHookValidator();
// }
