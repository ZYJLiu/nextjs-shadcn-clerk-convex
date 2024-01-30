// import highlightjs from "highlight.js";
// import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";
import { useCodeStore } from "../state/code-store";

import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useGame } from "../hooks/useGame";

interface TypedCharsProps {
  language: string;
}

export function TypedChars({ language }: TypedCharsProps) {
  const game = useGame();
  // const { isAuthenticated } = useConvexAuth();
  // const localStorageKey = isAuthenticated ? "authGameId" : "unauthGameId";
  // const gameId = localStorage.getItem(localStorageKey) as Id<"games">;
  // const game = useQuery(api.games.get, { gameId });

  const isSyntaxHighlightingEnabled = false;
  // useCodeStore((state) => state.code);

  // const index = useCodeStore((state) => state.index);
  // const typedChars = useCodeStore((state) => state.correctChars);

  // const typedChars = () => {
  //   if (!game) return "";
  //   return correctChars(game.code!, game.index!);
  // };
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isSyntaxHighlightingEnabled) return;
    if (typedRef.current) {
      const element = typedRef.current;

      // Clear the previous highlights
      element.innerHTML = element.textContent || "";

      // // Apply new highlighting
      // highlightjs.highlightElement(element);
    }
  }, [game, isSyntaxHighlightingEnabled]);

  return (
    <span
      className={`text-violet-400 ${language}`}
      ref={typedRef}
      style={{ background: "none" }}
    >
      {game?.correctChars}
    </span>
  );
}

function correctChars(code: string, correctIndex: number): string {
  return code.slice(0, correctIndex);
}
