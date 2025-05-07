
// Import the correct interfaces
import { TokenData as SessionTokenData, Initiative as SessionInitiative } from '@/types/session.types';

// Fix the convertInitiative function to properly convert between types
const convertInitiative = (init: Initiative[]): SessionInitiative[] => {
  return init.map(item => ({
    id: String(item.id),
    name: item.name,
    initiative: item.roll,
    roll: item.roll,
    isActive: item.isActive,
    tokenId: item.tokenId ? String(item.tokenId) : undefined
  }));
};

// Fix the component props passed to BattleMap
<BattleMap
  tokens={tokens.map(t => ({
    ...t,
    id: String(t.id) // Convert number IDs to string
  })) as unknown as SessionTokenData[]}
  setTokens={setTokens as any}
  background={background}
  setBackground={setBackground}
  onUpdateTokenPosition={(id, x, y) => updateTokenPosition(Number(id), x, y)}
  onSelectToken={(id) => setSelectedTokenId(id ? Number(id) : null)}
  selectedTokenId={selectedTokenId ? String(selectedTokenId) : null}
  initiative={convertInitiative(initiative)}
  battleActive={battleActive}
/>
