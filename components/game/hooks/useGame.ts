import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export function useGame() {
  const { isAuthenticated } = useConvexAuth();
  const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
  const gameId = localStorage.getItem(localStorageKey) as Id<"games">;
  const game = useQuery(api.games.get, { gameId });

  return game;
}
