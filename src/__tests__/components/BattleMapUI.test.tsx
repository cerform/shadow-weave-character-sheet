/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import BattleMapUI from "@/components/battle/BattleMapUI";
import { vi } from "vitest";

// Мокаем сложные зависимости
vi.mock("@/stores/monstersStore", () => ({
  useMonstersStore: () => ({
    getAllMonsters: vi.fn(() => []),
    loadSupabaseMonsters: vi.fn(),
    isLoadingSupabase: false,
  }),
}));

vi.mock("@/stores/unifiedBattleStore", () => ({
  useUnifiedBattleStore: () => ({
    tokens: [],
    addToken: vi.fn(),
  }),
}));

vi.mock("@/stores/enhancedBattleStore", () => ({
  useEnhancedBattleStore: () => ({
    tokens: [],
    mapImageUrl: null,
    setMapImageUrl: vi.fn(),
  }),
}));

vi.mock("@/stores/battleStore", () => ({
  __esModule: true,
  default: () => ({
    tokens: [],
  }),
}));

vi.mock("@/stores/fogStore", () => ({
  useFogStore: () => ({
    maps: {},
    sizes: {},
  }),
}));

vi.mock("@/hooks/useBattleSession", () => ({
  useBattleSession: () => ({
    session: { id: "test-session", name: "Test Session" },
    currentMap: null,
    saveMapFromUrl: vi.fn(),
    saveMapToSession: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useUserRole: () => ({
    isDM: true,
    isPlayer: false,
  }),
}));

vi.mock("@/hooks/useBattleTokensSync", () => ({
  useBattleTokensSync: vi.fn(),
}));

vi.mock("@/hooks/useBattleTokensToSupabase", () => ({
  useBattleTokensToSupabase: vi.fn(),
}));

vi.mock("@/hooks/useBattleMapSync", () => ({
  useBattleMapSync: vi.fn(),
}));

vi.mock("@/hooks/useFogSync", () => ({
  useFogSync: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Мокаем компоненты которые используют Canvas/Three.js
vi.mock("@/components/battle/SimpleTokenCreator", () => ({
  __esModule: true,
  default: () => <div data-testid="token-creator">Token Creator</div>,
}));

vi.mock("@/components/battle/VideoChat", () => ({
  VideoChat: () => <div data-testid="video-chat">Video Chat</div>,
}));

vi.mock("@/components/battle/PlayersList", () => ({
  PlayersList: () => <div data-testid="players-list">Players List</div>,
}));

vi.mock("@/components/battle/BackgroundMusic", () => ({
  __esModule: true,
  default: () => <div data-testid="background-music">Background Music</div>,
}));

vi.mock("@/components/battle/minimap/MiniMap2D", () => ({
  __esModule: true,
  default: () => <div data-testid="minimap">MiniMap</div>,
}));

vi.mock("@/components/battle/ui/AssetUploader", () => ({
  __esModule: true,
  default: () => <div data-testid="asset-uploader">Asset Uploader</div>,
}));

vi.mock("@/components/battle/vtt/VTTToolbar", () => ({
  __esModule: true,
  default: () => <div data-testid="vtt-toolbar">VTT Toolbar</div>,
}));

vi.mock("@/components/battle/vtt/LayerPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="layer-panel">Layer Panel</div>,
}));

vi.mock("@/components/battle/vtt/ContextMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="context-menu">Context Menu</div>,
}));

vi.mock("@/components/battle/FogOfWar", () => ({
  __esModule: true,
  default: () => <div data-testid="fog-of-war">Fog of War</div>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BattleMapUI Component", () => {
  const renderBattleMapUI = (sessionId?: string) => {
    return render(
      <BrowserRouter>
        <BattleMapUI sessionId={sessionId} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("рендерит без краха с валидным sessionId", () => {
    renderBattleMapUI("test-session-123");
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
  });

  test("показывает ошибку при отсутствии sessionId", () => {
    renderBattleMapUI(undefined);
    
    expect(screen.getByText(/некорректный id сессии/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /вернуться/i })).toBeInTheDocument();
  });

  test("отображает основные UI элементы для DM", () => {
    renderBattleMapUI("test-session-123");
    
    // Проверяем наличие ключевых компонентов
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
    expect(screen.getByTestId("vtt-toolbar")).toBeInTheDocument();
  });

  test("кнопка возврата вызывает navigate", async () => {
    const user = userEvent.setup();
    renderBattleMapUI(undefined);
    
    const backButton = screen.getByRole("button", { name: /вернуться/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith("/dm");
  });

  test("компонент инициализируется с корректным sessionId", () => {
    const sessionId = "valid-session-id";
    renderBattleMapUI(sessionId);
    
    // Проверяем что компонент не показывает ошибку
    expect(screen.queryByText(/некорректный id сессии/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
  });

  test("не ломается при рендеринге компонентов боевой системы", () => {
    renderBattleMapUI("test-session-123");
    
    // Проверяем что основные компоненты отрендерены
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
    expect(screen.getByTestId("vtt-toolbar")).toBeInTheDocument();
  });

  test("рендерит без краха при смене sessionId", () => {
    const { rerender } = renderBattleMapUI("session-1");
    
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
    
    rerender(
      <BrowserRouter>
        <BattleMapUI sessionId="session-2" />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId("token-creator")).toBeInTheDocument();
  });
});
