import highlightjs from "highlight.js";
import "highlight.js/styles/panda-syntax-dark.css";
import { useEffect, useRef } from "react";
import { useGame } from "../hooks/useGame";

interface TypedCharsProps {
  language: string;
}

export function TypedChars({ language }: TypedCharsProps) {
  const { game } = useGame();
  const isSyntaxHighlightingEnabled = true;
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isSyntaxHighlightingEnabled) return;
    if (typedRef.current) {
      console.log("highlighting");
      const element = typedRef.current;

      // Clear the previous highlights
      element.innerHTML = element.textContent || "";

      // Remove the attribute set by Highlight.js
      element.removeAttribute("data-highlighted");

      // Apply new highlighting
      highlightjs.highlightElement(element);
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
