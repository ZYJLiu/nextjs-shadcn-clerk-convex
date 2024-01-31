"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Preloaded,
  useConvexAuth,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";

export interface GameContextValue {
  game: Doc<"games"> | null | undefined;
  gameId: Id<"games"> | undefined;
}

const defaultContextValue: GameContextValue = {
  game: null,
  gameId: undefined,
};

const GameContext = createContext<GameContextValue>(defaultContextValue);

export function useGameContext() {
  return useContext(GameContext);
}

let renderCount = 0;

export function GameProvider({
  children,
  preloaded,
}: {
  children: React.ReactNode;
  preloaded: Preloaded<typeof api.code.get>;
}) {
  const data = usePreloadedQuery(preloaded);

  const { isAuthenticated } = useConvexAuth();
  const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
  const [gameId, setGameId] = useState(() => {
    if (typeof window !== "undefined") {
      const storedGameId = localStorage.getItem(localStorageKey);
      return storedGameId ? (storedGameId as Id<"games">) : undefined;
    }
  });
  const initialGameDataLoaded = useRef(false);

  const game = useQuery(
    api.games.get,
    gameId !== undefined && gameId !== null ? { gameId } : "skip"
  );

  const createGame = useMutation(api.games.createGame);
  const reset = useMutation(api.games.reset);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        // Create a new game if no gameId is found
        const newGameId = await createGame({ code: data! });
        localStorage.setItem(localStorageKey, newGameId);
        setGameId(newGameId);
      }

      if (isAuthenticated) {
        setGameId(localStorage.getItem(localStorageKey) as Id<"games">);
      }
    };

    fetchGame();
  }, [gameId, isAuthenticated]);

  useEffect(() => {
    if (gameId && game?.code && !initialGameDataLoaded.current) {
      if (game?.startTime !== undefined) {
        console.log("resetting game");
        reset({ gameId, code: game.code });
      }
      initialGameDataLoaded.current = true;
    }
  }, [game]);

  useEffect(() => {
    renderCount += 1;
    console.log(`GameProvider rendered ${renderCount} times`);
    // console.log("gameId", gameId);
    // console.log("game", game);
    console.log("hasReset", initialGameDataLoaded.current);
    console.log("id", gameId);
    console.log(localStorageKey);
  });

  const value = useMemo(
    () => ({
      game,
      gameId,
      //   localStorageKey,
      //   setGameId,
    }),
    [game, gameId]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
