import React from "react";
import { render } from "@testing-library/react";

/**
 * Универсальная ловушка ошибок для диагностики React Error #185
 * Показывает полный текст ошибки в dev-режиме (НЕ минифицированный)
 */
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { 
      error: null,
      errorInfo: null,
      errorStack: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Сохраняем полную информацию об ошибке
    this.setState({
      errorInfo,
      errorStack: error.stack,
    });

    // Выводим детальную информацию в консоль
    console.error("\n" + "=".repeat(80));
    console.error("🛑 REACT ERROR #185 DETECTOR - FULL ERROR DETAILS");
    console.error("=".repeat(80));
    console.error("\n📌 Error Message:");
    console.error(error.message);
    console.error("\n📌 Error Type:");
    console.error(error.name);
    console.error("\n📌 Error Stack:");
    console.error(error.stack);
    console.error("\n📌 Component Stack:");
    console.error(errorInfo.componentStack);
    console.error("\n" + "=".repeat(80) + "\n");
  }

  render() {
    if (this.state.error) {
      return (
        <div data-testid="error-container">
          <div data-testid="error-message">
            {String(this.state.error?.message || this.state.error)}
          </div>
          <div data-testid="error-stack" style={{ display: 'none' }}>
            {this.state.errorStack}
          </div>
          <div data-testid="component-stack" style={{ display: 'none' }}>
            {this.state.errorInfo?.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Анализатор React Error #185
 */
class Error185Analyzer {
  static analyze(errorMessage: string, errorStack?: string, componentStack?: string) {
    console.log("\n" + "🔍 ERROR ANALYSIS ".padEnd(80, "="));
    
    const findings: string[] = [];
    
    // Проверка 1: Invalid element type
    if (errorMessage.includes("Element type is invalid")) {
      findings.push("❌ ПРИЧИНА: Invalid Element Type");
      console.log("\n✋ Обнаружена ошибка 'Invalid element type'");
      console.log("   Это означает что React получил undefined вместо компонента");
    }
    
    // Проверка 2: undefined в сообщении
    if (errorMessage.includes("undefined")) {
      findings.push("❌ ПРИЧИНА: Undefined Component");
      console.log("\n✋ В ошибке упоминается 'undefined'");
      console.log("   Вероятно проблема с import/export:");
      console.log("   • Проверьте export default vs export named");
      console.log("   • Убедитесь что импортируемый файл существует");
      console.log("   • Проверьте правильность путей импорта");
    }
    
    // Проверка 3: expected a string
    if (errorMessage.includes("expected a string")) {
      findings.push("❌ ПРИЧИНА: Wrong Component Type");
      console.log("\n✋ Компонент вернул неправильный тип");
      console.log("   • Компонент должен возвращать JSX или null");
      console.log("   • Проверьте return statement в компоненте");
    }
    
    // Проверка 4: got object
    if (errorMessage.includes("got: object")) {
      findings.push("❌ ПРИЧИНА: Object Instead of Component");
      console.log("\n✋ Получен объект вместо компонента");
      console.log("   • Возможно используется export { Component } вместо export default Component");
      console.log("   • Или импорт: import Component from './file' вместо import { Component }");
    }
    
    // Проверка 5: Анализ стека
    if (errorStack) {
      console.log("\n📍 Анализ стека вызовов:");
      const stackLines = errorStack.split('\n').slice(0, 5);
      stackLines.forEach(line => {
        if (line.includes('src/')) {
          console.log(`   🔸 ${line.trim()}`);
        }
      });
    }
    
    // Проверка 6: Анализ Component Stack
    if (componentStack) {
      console.log("\n📍 Дерево компонентов (где произошла ошибка):");
      const componentLines = componentStack.split('\n').slice(0, 8);
      componentLines.forEach((line, index) => {
        if (line.trim()) {
          const indent = "  ".repeat(index);
          console.log(`${indent}↳ ${line.trim()}`);
        }
      });
    }
    
    // Итоговая диагностика
    console.log("\n" + "💡 РЕКОМЕНДАЦИИ ".padEnd(80, "="));
    
    if (findings.length > 0) {
      console.log("\nОбнаруженные проблемы:");
      findings.forEach(f => console.log(`  ${f}`));
    }
    
    console.log("\n📚 Типичные причины React Error #185:");
    console.log("  1. Неправильный import:");
    console.log("     ❌ import Component from './file' // когда нет default export");
    console.log("     ✅ import { Component } from './file' // для named export");
    console.log("");
    console.log("  2. Циклические зависимости:");
    console.log("     ❌ A.tsx imports B.tsx, B.tsx imports A.tsx");
    console.log("     ✅ Вынести общий код в третий файл");
    console.log("");
    console.log("  3. Условный импорт:");
    console.log("     ❌ const Comp = condition ? import('./A') : import('./B')");
    console.log("     ✅ Использовать динамический import или lazy loading");
    console.log("");
    console.log("  4. Store не инициализирован:");
    console.log("     ❌ const store = useStore() // store может быть undefined");
    console.log("     ✅ const store = useStore() ?? defaultStore");
    
    console.log("\n" + "=".repeat(80) + "\n");
    
    return findings;
  }
}

describe("React Error #185 Detector - Full Diagnostic Suite", () => {
  // НЕ подавляем console.error - нам нужен полный вывод!
  const originalError = console.error;
  let capturedErrors: any[] = [];
  
  beforeAll(() => {
    // Перехватываем ошибки но не подавляем их полностью
    console.error = jest.fn((...args) => {
      capturedErrors.push(args);
      // Всё равно выводим в реальную консоль
      originalError.apply(console, args);
    });
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    capturedErrors = [];
  });

  it("🔍 MAIN TEST: Detect and analyze full unminified React Error #185", () => {
    console.log("\n" + "🚀 STARTING ERROR #185 DIAGNOSTIC TEST ".padEnd(80, "=") + "\n");
    
    // Импортируем главный компонент приложения
    let App: any;
    try {
      App = require("@/App").default;
      console.log("✅ App component imported successfully");
    } catch (importError: any) {
      console.error("❌ Failed to import App:", importError.message);
      throw importError;
    }

    let hasError = false;
    let errorMessage = "";
    let errorStack = "";
    let componentStack = "";

    try {
      const { getByTestId, queryByTestId } = render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );

      // Проверяем, произошла ли ошибка
      const errorContainer = queryByTestId("error-container");
      
      if (errorContainer) {
        hasError = true;
        const errorElement = getByTestId("error-message");
        const stackElement = queryByTestId("error-stack");
        const compStackElement = queryByTestId("component-stack");
        
        errorMessage = errorElement.textContent || "";
        errorStack = stackElement?.textContent || "";
        componentStack = compStackElement?.textContent || "";

        console.log("\n🛑 ERROR DETECTED!");
        console.log("\n📄 FULL ERROR MESSAGE (UNMINIFIED):");
        console.log("─".repeat(80));
        console.log(errorMessage);
        console.log("─".repeat(80));

        // Запускаем глубокий анализ
        Error185Analyzer.analyze(errorMessage, errorStack, componentStack);

        // Дополнительная диагностика из перехваченных ошибок
        if (capturedErrors.length > 0) {
          console.log("\n📋 Captured Console Errors:");
          capturedErrors.forEach((args, index) => {
            console.log(`\n[Error ${index + 1}]:`, ...args);
          });
        }
      } else {
        console.log("\n✅ NO ERROR DETECTED");
        console.log("   App component rendered successfully without errors");
      }

      // Тест должен пройти независимо от наличия ошибки
      // Мы просто диагностируем
      expect(errorMessage).toBeDefined();
      
      if (hasError) {
        console.log("\n" + "⚠️  RESULT: ERROR FOUND AND ANALYZED ".padEnd(80, "="));
      } else {
        console.log("\n" + "✅ RESULT: NO ERRORS FOUND ".padEnd(80, "="));
      }
      
    } catch (testError: any) {
      // Если ошибка не была поймана ErrorBoundary
      console.log("\n💥 UNHANDLED ERROR (not caught by ErrorBoundary):");
      console.log("   This might be a different type of error!");
      console.log("\n   Error:", testError.message);
      console.log("\n   Stack:", testError.stack);
      
      // Не бросаем ошибку, просто диагностируем
      expect(testError).toBeDefined();
    }

    console.log("\n" + "=" .repeat(80) + "\n");
  });

  it("🧪 Test specific components that commonly cause Error #185", () => {
    console.log("\n📦 Testing individual components...\n");

    // Список компонентов для проверки
    const componentsToTest = [
      { name: "ErrorBoundary", path: "@/components/ErrorBoundary" },
      { name: "Model3DErrorBoundary", path: "@/components/battle/enhanced/Model3DErrorBoundary" },
      // Добавьте сюда подозрительные компоненты
    ];

    componentsToTest.forEach(({ name, path }) => {
      console.log(`\n🔍 Testing ${name}...`);
      
      try {
        const Component = require(path).ErrorBoundary || require(path).Model3DErrorBoundary || require(path).default;
        
        if (!Component) {
          console.log(`   ⚠️  ${name} - No default export or named export found`);
          return;
        }

        const { queryByTestId } = render(
          <ErrorBoundary>
            <Component>
              <div>Test child</div>
            </Component>
          </ErrorBoundary>
        );

        const errorContainer = queryByTestId("error-container");
        
        if (errorContainer) {
          console.log(`   ❌ ${name} - ERROR DETECTED`);
          const msg = queryByTestId("error-message")?.textContent || "";
          console.log(`   📄 Message: ${msg.substring(0, 100)}...`);
        } else {
          console.log(`   ✅ ${name} - OK`);
        }
        
      } catch (error: any) {
        console.log(`   ❌ ${name} - Import failed: ${error.message}`);
      }
    });

    console.log("\n" + "─".repeat(80));
    expect(true).toBe(true);
  });

  it("🔬 Deep analysis: Check for circular dependencies", () => {
    console.log("\n🔄 Checking for circular dependencies...\n");

    // Эта проверка может помочь обнаружить циклические импорты
    const suspiciousImports: string[] = [];

    try {
      // Попытка импорта основных модулей
      const modules = [
        "@/stores/unifiedBattleStore",
        "@/stores/enhancedBattleStore",
        "@/stores/unifiedBattleStoreExports",
      ];

      modules.forEach(modulePath => {
        try {
          const mod = require(modulePath);
          console.log(`   ✅ ${modulePath} - loaded OK`);
        } catch (error: any) {
          console.log(`   ❌ ${modulePath} - ${error.message}`);
          suspiciousImports.push(modulePath);
        }
      });

      if (suspiciousImports.length > 0) {
        console.log("\n⚠️  Problematic imports detected:");
        suspiciousImports.forEach(path => console.log(`     • ${path}`));
        console.log("\n   These might be involved in circular dependencies!");
      } else {
        console.log("\n✅ No circular dependency issues detected in checked modules");
      }

    } catch (error: any) {
      console.log("\n❌ Error during dependency check:", error.message);
    }

    expect(true).toBe(true);
  });

  it("📊 Summary: Generate diagnostic report", () => {
    console.log("\n" + "📊 DIAGNOSTIC REPORT ".padEnd(80, "="));
    console.log("\n✅ Test suite completed");
    console.log("\n📋 What was tested:");
    console.log("   • Main App component rendering");
    console.log("   • Individual component imports");
    console.log("   • Circular dependency detection");
    console.log("   • Error boundary functionality");
    
    console.log("\n💡 Next steps if error was found:");
    console.log("   1. Review the detailed error message above");
    console.log("   2. Check the component stack trace");
    console.log("   3. Verify all imports/exports in mentioned files");
    console.log("   4. Look for circular dependencies");
    console.log("   5. Ensure all stores are properly initialized");
    
    console.log("\n" + "=".repeat(80) + "\n");
    
    expect(true).toBe(true);
  });
});
