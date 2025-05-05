import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCharacter } from "@/contexts/CharacterContext";
import useSessionStore from "@/stores/sessionStore";
import { toast } from "sonner";
import type { CharacterSheet } from "@/utils/characterImports";

const CharactersListPage = () => {
  const navigate = useNavigate();
  const { characters, getUserCharacters, deleteCharacter, setCharacter } = useCharacter();
  const sessionStore = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        await getUserCharacters();
      } catch (error) {
        console.error("Failed to fetch characters:", error);
        toast.error("Failed to load characters.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [getUserCharacters]);

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      setDeletingCharacterId(characterId);
      await deleteCharacter(characterId);
      toast.success("Character deleted successfully.");
    } catch (error) {
      console.error("Failed to delete character:", error);
      toast.error("Failed to delete character.");
    } finally {
      setDeletingCharacterId(null);
    }
  };

  const handleLoadCharacter = (character: CharacterSheet) => {
    setCharacter(character);
    navigate("/sheet");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Characters</h1>
      {isLoading ? (
        <p>Loading characters...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Race</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters && characters.length > 0 ? (
                characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell>{character.name}</TableCell>
                    <TableCell>{character.race}</TableCell>
                    <TableCell>{character.class}</TableCell>
                    <TableCell>{character.level}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleLoadCharacter(character)}>
                        Load
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deletingCharacterId === character.id}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Are you sure you want to delete {character.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCharacter(character.id)}
                              disabled={deletingCharacterId === character.id}
                            >
                              {deletingCharacterId === character.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No characters found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <Button variant="outline" onClick={() => navigate("/character-creation")}>
        Create New Character
      </Button>
      <Button variant="secondary" onClick={() => navigate("/dm")}>
        Back to DM Dashboard
      </Button>
    </div>
  );
};

export default CharactersListPage;
