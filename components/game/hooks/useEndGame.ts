import { useEffect } from "react";
import { useIsPlaying } from "./useIsPlaying";
import { useCodeStore } from "../state/code-store";
import { useIsCompleted } from "./useIsCompleted";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useEndGame() {
  const reset = useMutation(api.games.reset);

  const endGame = useCodeStore((state) => state.end);
  const isCompleted = useIsCompleted();
  const isPlaying = useIsPlaying();
  useEffect(() => {
    if (isCompleted && isPlaying) {
      endGame();

      // reset();
    }
  }, [endGame, isPlaying, isCompleted]);
}
