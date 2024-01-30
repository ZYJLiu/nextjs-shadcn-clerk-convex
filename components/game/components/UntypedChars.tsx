import { useConvexAuth, useQuery } from "convex/react";
import { useCodeStore } from "../state/code-store";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useGame } from "../hooks/useGame";
export function UntypedChars() {
  const game = useGame();
  // const { isAuthenticated } = useConvexAuth();
  // const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
  // const gameId = localStorage.getItem(localStorageKey) as Id<"games">;
  // const game = useQuery(api.games.get, { gameId });
  // Calculate untyped characters
  // const untyped = untypedChars(game?.code ?? "", game?.index ?? 0);
  // const untypedChars = useCodeStore((state) => state.untypedChars);

  return <>{game?.untypedChars}</>;
}
