import React from "react";
import LeftPanel from "@/components/battle/LeftPanel";
import BattleMap from "@/components/battle/BattleMap";
import RightPanel from "@/components/battle/RightPanel";

const PlayBattlePage = () => {
  return (
    <div className="grid grid-cols-[250px_1fr_350px] h-screen overflow-hidden bg-background text-foreground">
      {/* Левая панель */}
      <LeftPanel />

      {/* Карта боя */}
      <BattleMap />

      {/* Правая панель */}
      <RightPanel />
    </div>
  );
};

export default PlayBattlePage;
