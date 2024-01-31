import { useEffect } from "react";
import { useIsPlaying } from "./useIsPlaying";
import { useIsCompleted } from "./useIsCompleted";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGameContext } from "@/components/providers/game-provider";

export function useEndGame() {
  const { gameId } = useGameContext();
  const end = useMutation(api.games.end);

  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  useEffect(() => {
    if (isCompleted && isPlaying && gameId) {
      end({ gameId });
    }
  }, [isPlaying, isCompleted]);
}
