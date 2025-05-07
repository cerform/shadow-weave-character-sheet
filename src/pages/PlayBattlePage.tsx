import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { User } from '@/types/auth';
import { Canvas } from '@/components/battle/Canvas';
import { LeftPanel } from '@/components/battle/LeftPanel';
import { RightPanel } from '@/components/battle/RightPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useBattleStore } from '@/stores/battleStore';
import { Token } from '@/types/battle';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CharacterSelector } from '@/components/battle/CharacterSelector';
import { api } from '@/utils/api';

const PlayBattlePage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { characterId } = router.query;
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDM, setIsDM] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
	const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const { user } = useUser();
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] = useState(false);
	const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
	
	const utils = api.useContext();

  // Access battle store
  const addLightSource = useBattleStore((state) => state.addLightSource);
  const removeLightSource = useBattleStore((state) => state.removeLightSource);
  const updateLightSource = useBattleStore((state) => state.updateLightSource);
  const setGridSize = useBattleStore((state) => state.setGridSize);
  const gridSize = useBattleStore((state) => state.gridSize);
  const setBattleName = useBattleStore((state) => state.setBattleName);
  const battleName = useBattleStore((state) => state.battleName);
  const setBackgroundImage = useBattleStore((state) => state.setBackgroundImage);
  const backgroundImage = useBattleStore((state) => state.backgroundImage);
  const lightSources = useBattleStore((state) => state.lightSources);

	// Fetch all characters for the character selector
	useEffect(() => {
		const fetchCharacters = async () => {
			if (!user) return;
			try {
				const fetchedCharacters = await utils.character.getCharacters.refetch();
				setAvailableCharacters(fetchedCharacters || []);
			} catch (err) {
				console.error("Failed to fetch characters:", err);
				toast({
					title: "Ошибка при загрузке персонажей",
					description: "Не удалось загрузить список персонажей.",
					variant: "destructive",
				});
			}
		};

		fetchCharacters();
	}, [user, utils.character.getCharacters, toast]);

  // Fetch character data
  useEffect(() => {
    if (!characterId || !user) return;

    const fetchCharacter = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = await fetch(`/api/characters/${characterId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCharacter(data);
      } catch (e: any) {
        console.error("Could not fetch character:", e);
        setError(e.message || "Failed to load character");
        toast({
          title: "Ошибка при загрузке персонажа",
          description: "Не удалось загрузить персонажа. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId, user, toast]);

  // Determine if the user is a DM
  useEffect(() => {
    if (user && user.role === 'dm') {
      setIsDM(true);
    } else {
      setIsDM(false);
    }
  }, [user]);

  // Token management functions
  const handleAddToken = (token: Token) => {
    setTokens(prev => [...prev, token]);
  };

  const handleUpdateToken = (updatedToken: Token) => {
    setTokens(prevTokens =>
      prevTokens.map(token =>
        token.id === updatedToken.id ? { ...token, ...updatedToken } : token
      )
    );
  };

  const handleDeleteToken = (id: number) => {
    setTokens(prevTokens => prevTokens.filter(token => token.id !== id));
		if (selectedTokenId === id) {
			setSelectedTokenId(null);
		}
  };

  const handleSelectToken = (id: number) => {
    setSelectedTokenId(id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!character) {
    return <div>Character not found</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel */}
        <LeftPanel
          character={character}
          isDM={isDM}
          tokens={tokens}
          onAddToken={handleAddToken}
          onUpdateToken={handleUpdateToken}
          onDeleteToken={handleDeleteToken}
          onSelectToken={handleSelectToken}
          selectedTokenId={selectedTokenId}
          setGridSize={setGridSize}
          gridSize={gridSize}
          setBattleName={setBattleName}
          battleName={battleName}
          setBackgroundImage={setBackgroundImage}
        />

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto">
          <Canvas
            tokens={tokens}
            onUpdateToken={handleUpdateToken}
            onDeleteToken={handleDeleteToken}
            selectedTokenId={selectedTokenId}
            gridSize={gridSize}
            backgroundImage={backgroundImage}
            lightSources={lightSources}
            addLightSource={addLightSource}
            removeLightSource={removeLightSource}
            updateLightSource={updateLightSource}
          />
        </div>

        {/* Right Panel */}
        <RightPanel
          character={character}
          isDM={isDM}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          onSelectToken={handleSelectToken}
          onUpdateToken={handleUpdateToken}
        />
				{isDM && (
					<Button
						onClick={() => setIsCharacterSelectorOpen(true)}
						className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
					>
						<Plus className="h-4 w-4 mr-2" />
						Добавить персонажа
					</Button>
				)}
      </div>
			<CharacterSelector
				open={isCharacterSelectorOpen}
				onClose={() => setIsCharacterSelectorOpen(false)}
				onAddCharacter={handleAddToken}
				availableCharacters={availableCharacters}
			/>
    </DndProvider>
  );
};

export default PlayBattlePage;
