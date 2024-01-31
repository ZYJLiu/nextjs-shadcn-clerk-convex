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
  const [gameId, setGameId] = useState<Id<"games"> | undefined>();
  const initialGameDataLoaded = useRef(false);

  // Load or create gameId
  useEffect(() => {
    const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
    const initializeGameId = async () => {
      if (typeof window !== "undefined") {
        let storedGameId = localStorage.getItem(localStorageKey) as
          | Id<"games">
          | undefined;

        if (!storedGameId) {
          // Only create a new game if there isn't one already in localStorage
          storedGameId = await createGame({ code: data! });
          localStorage.setItem(localStorageKey, storedGameId);
        }

        setGameId(storedGameId);
        initialGameDataLoaded.current = false;
      }
    };

    initializeGameId();
  }, [isAuthenticated, data]);

  const game = useQuery(api.games.get, gameId ? { gameId } : "skip");
  const createGame = useMutation(api.games.createGame);
  const reset = useMutation(api.games.reset);

  // Reset game when needed
  useEffect(() => {
    const resetGame = async () => {
      if (
        gameId &&
        // game?.startTime !== undefined &&
        !initialGameDataLoaded.current
      ) {
        await reset({ gameId, code: data! });
        initialGameDataLoaded.current = true;
      }
    };

    resetGame();
  }, [gameId, game, data]);

  const value = useMemo(
    () => ({
      game,
      gameId,
    }),
    [game, gameId]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
