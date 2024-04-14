import highlightjs from "highlight.js";
import "highlight.js/styles/tokyo-night-dark.css";
import { useEffect, useRef } from "react";
import { useGameContext } from "@/components/providers/game-provider";

interface TypedCharsProps {
  language: string;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function TypedChars({ language }: TypedCharsProps) {
  const { game } = useGameContext();
  const typedRef = useRef<HTMLSpanElement>(null);

  // const isSyntaxHighlightingEnabled = true;
  // useEffect(() => {
  //   if (!isSyntaxHighlightingEnabled) return;
  //   if (typedRef.current) {
  //     const element = typedRef.current;

  //     // Clear the previous highlights
  //     element.innerHTML = escapeHtml(element.textContent || "");

  //     // Remove the attribute
  //     element.removeAttribute("data-highlighted");

  //     // Apply new highlighting
  //     highlightjs.highlightElement(element);
  //   }
  // }, [game, isSyntaxHighlightingEnabled]);

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
