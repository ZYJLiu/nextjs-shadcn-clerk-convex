import { useGameContext } from "@/components/providers/game-provider";

export const useIsCompleted = () => {
  const { game } = useGameContext();
  return game?.code?.length === game?.correctIndex;
};
