// import highlightjs from "highlight.js";
// import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";
import { useGame } from "../hooks/useGame";

interface TypedCharsProps {
  language: string;
}

export function TypedChars({ language }: TypedCharsProps) {
  const { game } = useGame();

  const isSyntaxHighlightingEnabled = false;
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
