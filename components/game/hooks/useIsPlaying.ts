import { useGameContext } from "@/components/providers/game-provider";

export const useIsPlaying = () => {
  const { game } = useGameContext();
  return game?.startTime !== undefined;
};
