import React, { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGameContext } from "@/components/providers/game-provider";
import { useNewCode } from "../hooks/useNewCode";

export default function Refresh() {
  const { gameId } = useGameContext();
  const newCode = useNewCode();
  const reset = useMutation(api.games.reset);

  const handleRefresh = () => {
    console.log(newCode, gameId);
    console.log("resetting game");
    reset({ gameId: gameId!, code: newCode! });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleRefresh();
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameId, newCode]);

  return (
    <button
      onClick={handleRefresh}
      title="Refresh the challenge"
      className="flex text-sm font-light text-black items-center justify-center gap-2 rounded-3xl bg-gray-300 hover:bg-gray-400 hover:cursor-pointer px-3 py-0.5 my-1"
      style={{ fontFamily: "Fira Code" }}
    >
      <div className="hidden sm:flex">refresh</div>
    </button>
  );
}
