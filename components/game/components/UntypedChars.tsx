import { useGameContext } from "@/components/providers/game-provider";

export function UntypedChars() {
  const { game } = useGameContext();
  return <>{game?.untypedChars}</>;
}
