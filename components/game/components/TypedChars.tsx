import highlightjs from "highlight.js";
import "highlight.js/styles/base16/dark-violet.css";
import { useEffect, useRef } from "react";
import { useGameContext } from "@/components/providers/game-provider";
interface TypedCharsProps {
  language: string;
}

export function TypedChars({ language }: TypedCharsProps) {
  const { game } = useGameContext();
  const isSyntaxHighlightingEnabled = true;
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isSyntaxHighlightingEnabled) return;
    if (typedRef.current) {
      const element = typedRef.current;

      // Clear the previous highlights
      element.innerHTML = element.textContent || "";

      // Remove the attribute
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
