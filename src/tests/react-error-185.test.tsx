import React from "react";
import { render } from "@testing-library/react";

/**
 * Универсальная ловушка ошибок для диагностики React Error #185
 * Показывает полный текст ошибки в dev-режиме
 */
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🛑 React Error Caught:", error);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div data-testid="error-message">
          {String(this.state.error?.message || this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

describe("React error 185 detector", () => {
  // Подавляем console.error для чистоты вывода
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("should show full unminified error from App component", () => {
    // Импортируем главный компонент приложения
    const App = require("@/App").default;

    try {
      const { getByTestId } = render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );

      const errorElement = getByTestId("error-message");
      const msg = errorElement.textContent;

      console.log("\n🛑 FULL REACT ERROR:", msg);
      console.log("\n📋 Analysis:");
      
      if (msg?.includes("undefined")) {
        console.log("❌ Found 'undefined' in error - likely a missing export or import");
      }
      
      if (msg?.includes("Element type is invalid")) {
        console.log("❌ Invalid element type - check component imports");
      }
      
      if (msg?.includes("expected a string")) {
        console.log("❌ Component returned wrong type - should be React component");
      }

      expect(msg).toBeDefined();
      
      // Если мы дошли до сюда, значит ошибка была поймана
      console.log("\n✅ Error was caught successfully");
    } catch (error) {
      // Если ошибка не была поймана ErrorBoundary
      console.log("\n💥 Error was not caught by ErrorBoundary:");
      console.log(error);
      throw error;
    }
  });

  it("should test specific component that causes error #185", () => {
    // Если вы знаете конкретный компонент, который вызывает ошибку, 
    // раскомментируйте и замените на нужный:
    
    // const BattleMap = require("@/components/battle/enhanced/BattleMap").default;
    // const { getByTestId } = render(
    //   <ErrorBoundary>
    //     <BattleMap />
    //   </ErrorBoundary>
    // );
    
    // const msg = getByTestId("error-message").textContent;
    // console.log("🛑 COMPONENT ERROR:", msg);
    
    expect(true).toBe(true);
  });
});
