import React from "react";
import CreateSession from "../components/session/CreateSession";
import JoinSession from "../components/session/JoinSession";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRoomCreated = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const handleJoined = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="flex flex-col items-center p-8 gap-8">
      <h1 className="text-3xl font-bold">Shadow Weave — Character Sheet</h1>
      <CreateSession onRoomCreated={handleRoomCreated} />
      <JoinSession onJoined={handleJoined} />
    </div>
  );
};

export default Home;
