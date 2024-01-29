import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CodeTyping from "../components/Code";

export async function ServerComponent() {
  const preloaded = await preloadQuery(api.code.get);
  return <CodeTyping preloaded={preloaded} />;
}
