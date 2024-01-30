import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CodeTyping from "../components/Code";

export async function ServerComponent() {
  const random = Math.random();
  const preloaded = await preloadQuery(api.code.get, { random });
  return <CodeTyping preloaded={preloaded} />;
}
