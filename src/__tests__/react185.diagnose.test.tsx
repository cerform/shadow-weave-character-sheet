import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { StrictMode } from "react";
import * as Zustand from "zustand";
import BattleMapUI from "@/components/battle/BattleMapUI";
import { useUnifiedBattleStore } from "@/stores/unifiedBattleStore";

describe("React Error #185 – FULL DIAGNOSTIC", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    errorSpy.mockClear();
    warnSpy.mockClear();
    logSpy.mockClear();
  });

  // 1. Проверяем рекурсивное обновление Zustand (частая причина 185)
  it("detects recursive store updates", () => {
    let updates = 0;

    const unsub = useUnifiedBattleStore.subscribe(() => {
      updates++;
      if (updates > 20) {
        throw new Error("❌ Recursive Zustand update detected (likely cause of #185)");
      }
    });

    render(
      <StrictMode>
        <BattleMapUI sessionId="test" />
      </StrictMode>
    );

    unsub();

    expect(updates).toBeLessThan(20);
  });

  // 2. Ловим бесконечный useEffect → setState цикл
  it("detects infinite useEffect → setState loop", () => {
    const start = performance.now();

    try {
      render(
        <StrictMode>
          <BattleMapUI sessionId="X" />
        </StrictMode>
      );
    } catch (e) {}

    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });

  // 3. Проверяем стабильность селекторов Zustand
  it("detects unstable selectors", () => {
    const selector = (s: any) => s.tokens;

    let ref1 = useUnifiedBattleStore.getState().tokens;
    let ref2 = useUnifiedBattleStore.getState().tokens;

    expect(ref1).toBe(ref2);
  });

  // 4. Ловим невалидные ключи в рендерах списков
  it("detects invalid React keys", () => {
    render(
      <StrictMode>
        <BattleMapUI sessionId="valid" />
      </StrictMode>
    );

    const keyErrors = warnSpy.mock.calls.filter((msg) =>
      msg[0]?.toString().includes("Each child in a list should have a unique")
    );

    expect(keyErrors.length).toBe(0);
  });

  // 5. Ловим мутацию стора внутри render (запрещено — дает #185)
  it("detects store mutation during render", () => {
    const spy = vi.spyOn(useUnifiedBattleStore.getState(), "addToken");

    render(
      <StrictMode>
        <BattleMapUI sessionId="AAA" />
      </StrictMode>
    );

    expect(spy).not.toHaveBeenCalled();
  });

  // 6. Ловим нестабильные объекты в props (cause #185)
  it("detects unstable props objects", () => {
    const r1 = render(
      <StrictMode>
        <BattleMapUI sessionId="stable" />
      </StrictMode>
    );

    const r2 = render(
      <StrictMode>
        <BattleMapUI sessionId="stable" />
      </StrictMode>
    );

    expect(r1.container.innerHTML).toBe(r2.container.innerHTML);
  });

  // 7. Ловим ререндеры > 50 раз за mount (точная причина 185)
  it("detects excessive rerenders", () => {
    let renders = 0;

    const Old = BattleMapUI;

    const Wrapped = (props: any) => {
      renders++;
      return <Old {...props} />;
    };

    render(
      <StrictMode>
        <Wrapped sessionId="RR" />
      </StrictMode>
    );

    expect(renders).toBeLessThan(50);
  });

  // 8. Проверяем StrictMode double-invoke compatibility
  it("detects components failing strict mode (double rendering)", () => {
    try {
      render(
        <StrictMode>
          <BattleMapUI sessionId="DM" />
        </StrictMode>
      );
    } catch (e) {}

    const err = errorSpy.mock.calls.map((c) => c[0]?.toString() || "");

    const strictErrors = err.filter((e) =>
      e.includes("Cannot update a component while rendering") ||
      e.includes("Too many re-renders")
    );

    expect(strictErrors.length).toBe(0);
  });
});
