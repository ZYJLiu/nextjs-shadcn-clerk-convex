import { useGame } from "./useGame";

export const useIsPlaying = () => {
  const { game } = useGame();
  return game?.startTime !== undefined;
};
