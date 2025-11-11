/// <reference types="vitest/globals" />
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import AppRoutes from "@/AppRoutes";

describe("Routes smoke test", () => {
  test("mounts home route without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );
    // Если на главной есть какой-то стабильный маркер — проверь его.
    // Иначе просто убеждаемся, что нет исключений при монтировании.
    expect(true).toBe(true);
  });

  test("handles not-found route", () => {
    render(
      <MemoryRouter initialEntries={["/definitely-not-existing"]}>
        <AppRoutes />
      </MemoryRouter>
    );
    // Можно проверить наличие текста со страницы 404, если он статичен
    // expect(screen.getByText(/не найден/i)).toBeInTheDocument();
    expect(true).toBe(true);
  });
});
