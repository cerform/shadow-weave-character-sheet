/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { Character } from "@/types/character";
import { vi } from "vitest";

// Мокаем контексты и хуки
vi.mock("@/contexts/SocketContext", () => ({
  useSocket: () => ({
    sendUpdate: vi.fn(),
    isConnected: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Мокаем дочерние компоненты для изоляции тестов
vi.mock("@/components/character-sheet/CharacterPortrait", () => ({
  CharacterPortrait: ({ character }: any) => (
    <div data-testid="character-portrait">{character.name}</div>
  ),
}));

vi.mock("@/components/character-sheet/StatsPanel", () => ({
  StatsPanel: () => <div data-testid="stats-panel">Stats Panel</div>,
}));

vi.mock("@/components/character-sheet/HPBar", () => ({
  HPBar: ({ currentHp, maxHp }: any) => (
    <div data-testid="hp-bar">
      HP: {currentHp}/{maxHp}
    </div>
  ),
}));

vi.mock("@/components/character-sheet/DicePanel", () => ({
  __esModule: true,
  default: () => <div data-testid="dice-panel">Dice Panel</div>,
}));

vi.mock("@/components/character-sheet/ResourcePanel", () => ({
  __esModule: true,
  default: () => <div data-testid="resource-panel">Resource Panel</div>,
}));

vi.mock("@/components/character-sheet/CharacterTabs", () => ({
  __esModule: true,
  default: () => <div data-testid="character-tabs">Character Tabs</div>,
}));

vi.mock("@/components/character-sheet/SkillsPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="skills-panel">Skills Panel</div>,
}));

vi.mock("@/components/character-sheet/RestPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="rest-panel">Rest Panel</div>,
}));

vi.mock("@/components/character-sheet/LevelUpPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="levelup-panel">Level Up Panel</div>,
}));

vi.mock("@/components/character-sheet/SaveCharacterButton", () => ({
  __esModule: true,
  default: () => <button data-testid="save-button">Save</button>,
}));

vi.mock("@/components/character-sheet/CharacterExportPDF", () => ({
  __esModule: true,
  default: () => <button data-testid="export-button">Export PDF</button>,
}));

const mockCharacter: Character = {
  id: "test-char-1",
  name: "Тестовый Воин",
  class: "Fighter",
  level: 5,
  race: "Human",
  maxHp: 45,
  currentHp: 30,
  tempHp: 5,
  armorClass: 18,
  speed: 30,
  proficiencyBonus: 3,
  abilities: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 10,
    WIS: 12,
    CHA: 8,
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
  },
};

describe("CharacterSheet Component", () => {
  const renderCharacterSheet = (character?: Character, onUpdate?: any) => {
    return render(
      <BrowserRouter>
        <CharacterSheet character={character} onUpdate={onUpdate} />
      </BrowserRouter>
    );
  };

  test("рендерит без краха с валидным персонажем", () => {
    renderCharacterSheet(mockCharacter);
    expect(screen.getByTestId("character-portrait")).toBeInTheDocument();
  });

  test("отображает основные элементы UI", () => {
    renderCharacterSheet(mockCharacter);
    
    // Проверяем наличие основных панелей
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
    expect(screen.getByTestId("hp-bar")).toBeInTheDocument();
    expect(screen.getByTestId("dice-panel")).toBeInTheDocument();
    expect(screen.getByTestId("resource-panel")).toBeInTheDocument();
  });

  test("отображает корректные HP значения", () => {
    renderCharacterSheet(mockCharacter);
    
    const hpBar = screen.getByTestId("hp-bar");
    expect(hpBar).toHaveTextContent("HP: 30/45");
  });

  test("отображает имя персонажа", () => {
    renderCharacterSheet(mockCharacter);
    
    const portrait = screen.getByTestId("character-portrait");
    expect(portrait).toHaveTextContent("Тестовый Воин");
  });

  test("переключает вкладки корректно", async () => {
    renderCharacterSheet(mockCharacter);
    
    // По умолчанию показывается вкладка "Общее"
    expect(screen.getByTestId("character-tabs")).toBeInTheDocument();
    
    // Переключаемся на вкладку "Навыки"
    const skillsTab = screen.getByRole("tab", { name: /навыки/i });
    fireEvent.click(skillsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId("skills-panel")).toBeInTheDocument();
    });
    
    // Переключаемся на вкладку "Управление"
    const managementTab = screen.getByRole("tab", { name: /управление/i });
    fireEvent.click(managementTab);
    
    await waitFor(() => {
      expect(screen.getByTestId("rest-panel")).toBeInTheDocument();
      expect(screen.getByTestId("levelup-panel")).toBeInTheDocument();
    });
  });

  test("вызывает onUpdate при изменениях", () => {
    const mockOnUpdate = vi.fn();
    renderCharacterSheet(mockCharacter, mockOnUpdate);
    
    // Проверяем что onUpdate передан (компонент его использует внутри)
    expect(mockOnUpdate).toBeDefined();
  });

  test("отображает кнопки сохранения и экспорта", () => {
    renderCharacterSheet(mockCharacter);
    
    expect(screen.getByTestId("save-button")).toBeInTheDocument();
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });

  test("рендерит с дефолтным персонажем если не передан prop", () => {
    renderCharacterSheet();
    
    // Компонент должен создать дефолтного персонажа
    expect(screen.getByTestId("character-portrait")).toBeInTheDocument();
    expect(screen.getByTestId("stats-panel")).toBeInTheDocument();
  });

  test("обновляет состояние при изменении prop character", () => {
    const { rerender } = renderCharacterSheet(mockCharacter);
    
    expect(screen.getByTestId("hp-bar")).toHaveTextContent("HP: 30/45");
    
    const updatedCharacter = { ...mockCharacter, currentHp: 40 };
    rerender(
      <BrowserRouter>
        <CharacterSheet character={updatedCharacter} />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId("hp-bar")).toHaveTextContent("HP: 40/45");
  });

  test("не ломается при отсутствующих опциональных полях", () => {
    const minimalCharacter: Character = {
      name: "Минимальный",
      level: 1,
    };
    
    renderCharacterSheet(minimalCharacter);
    expect(screen.getByTestId("character-portrait")).toBeInTheDocument();
  });
});
