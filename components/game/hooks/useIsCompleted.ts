import { useGame } from "./useGame";

export const useIsCompleted = () => {
  const { game } = useGame();
  return game?.code?.length === game?.correctIndex;
};
