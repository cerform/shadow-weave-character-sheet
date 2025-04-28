# setup_project.py

import os

# Полный код для файлов сразу
full_files = {
    "backend/server.js": "(КОД server.js как выше)",
    "backend/package.json": "(КОД package.json как выше)",

    "shadow-weave-character-sheet/vite.config.ts": "(vite.config.ts как выше)",
    "shadow-weave-character-sheet/package.json": "(package.json фронтенда как выше)",
    "shadow-weave-character-sheet/index.html": "(index.html как выше)",

    "shadow-weave-character-sheet/src/main.tsx": "(main.tsx как выше)",
    "shadow-weave-character-sheet/src/App.tsx": "(App.tsx как выше)",
    "shadow-weave-character-sheet/src/services/socket.ts": "(socket.ts как выше)",

    # Новые страницы
    "shadow-weave-character-sheet/src/pages/Home.tsx": """
import React from 'react';
import CreateSession from '../components/session/CreateSession';
import JoinSession from '../components/session/JoinSession';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRoomCreated = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const handleJoined = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className=\"flex flex-col items-center p-8 gap-8\">
      <h1 className=\"text-3xl font-bold\">Shadow Weave — Character Sheet</h1>
      <CreateSession onRoomCreated={handleRoomCreated} />
      <JoinSession onJoined={handleJoined} />
    </div>
  );
};

export default Home;
""",

    "shadow-weave-character-sheet/src/pages/GameRoomPage.tsx": """
import React from 'react';
import SessionChat from '../components/session/SessionChat';
import DiceRoller from '../components/session/DiceRoller';

interface GameRoomPageProps {
  roomCode: string;
}

const GameRoomPage: React.FC<GameRoomPageProps> = ({ roomCode }) => {
  return (
    <div className=\"p-6\">
      <h1 className=\"text-2xl font-bold mb-4\">Комната: <span className=\"text-blue-600\">{roomCode}</span></h1>
      <SessionChat roomCode={roomCode} />
      <DiceRoller roomCode={roomCode} />
    </div>
  );
};

export default GameRoomPage;
""",

    # Новые компоненты
    "shadow-weave-character-sheet/src/components/session/CreateSession.tsx": "(CreateSession код)",
    "shadow-weave-character-sheet/src/components/session/JoinSession.tsx": "(JoinSession код)",
    "shadow-weave-character-sheet/src/components/session/SessionChat.tsx": "(SessionChat код)",
    "shadow-weave-character-sheet/src/components/session/DiceRoller.tsx": "(DiceRoller код)"
}

import argparse

def create_files(base_path, files):
    for path, content in files.items():
        full_path = os.path.join(base_path, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup full Shadow Weave project.")
    parser.add_argument('--path', type=str, required=True, help='Path to create project')
    args = parser.parse_args()

    create_files(args.path, full_files)

    print(f"\n✅ Полный проект со страницами и сессиями собран в: {args.path}\n")