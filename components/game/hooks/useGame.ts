import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export function useGame() {
  const { isAuthenticated } = useConvexAuth();
  const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
  const [gameId, setGameId] = useState(
    localStorage.getItem(localStorageKey) as Id<"games">
  );
  const game = useQuery(api.games.get, { gameId });
  const create = useMutation(api.games.createGame);

  useEffect(() => {
    const createAndStoreGame = async () => {
      if (!gameId) {
        const newGameId = await create();
        localStorage.setItem(localStorageKey, newGameId);
        setGameId(newGameId);
      }
    };

    createAndStoreGame();
  }, [gameId, create, localStorageKey]);

  return { game, gameId };
}
