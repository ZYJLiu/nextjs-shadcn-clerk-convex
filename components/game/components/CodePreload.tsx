import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CodeTyping from "./Code";
import { GameProvider } from "@/components/providers/game-provider";

export async function ServerComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const random = Math.random();
  const preloaded = await preloadQuery(api.code.get, { random });
  return <GameProvider preloaded={preloaded}>{children}</GameProvider>;
}
