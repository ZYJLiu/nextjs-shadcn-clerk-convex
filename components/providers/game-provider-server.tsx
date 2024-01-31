import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { GameProvider } from "@/components/providers/game-provider";

// Server component to preload the game code from convex
export async function GameServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const random = Math.random();
  const preloaded = await preloadQuery(api.code.get, { random });

  // Pass the preloaded query to the GameProvider
  return <GameProvider preloaded={preloaded}>{children}</GameProvider>;
}
