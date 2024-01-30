import { useGame } from "../hooks/useGame";
export function UntypedChars() {
  const { game } = useGame();
  return <>{game?.untypedChars}</>;
}
