// import { useState } from "react";
// import { api } from "@/convex/_generated/api";
// import { useConvexAuth, useQuery } from "convex/react";
// import { Id } from "@/convex/_generated/dataModel";

// export function useGame() {
//   const { isAuthenticated } = useConvexAuth();
//   const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
//   const [gameId, setGameId] = useState(() => {
//     const storedGameId = localStorage.getItem(localStorageKey);
//     return storedGameId ? (storedGameId as Id<"games">) : undefined;
//   });

//   const game = useQuery(
//     api.games.get,
//     gameId !== undefined ? { gameId } : "skip"
//   );

//   // console.log("game", game);
//   // console.log("gameId", gameId);

//   return { game, gameId, localStorageKey, setGameId };
// }
