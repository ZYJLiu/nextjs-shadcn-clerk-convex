import { useEffect } from "react";
import { useIsPlaying } from "./useIsPlaying";
import { useIsCompleted } from "./useIsCompleted";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGame } from "./useGame";

export function useEndGame() {
  const { gameId } = useGame();
  const end = useMutation(api.games.end);

  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  useEffect(() => {
    if (isCompleted && isPlaying) {
      end({ gameId });
    }
  }, [isPlaying, isCompleted]);
}
