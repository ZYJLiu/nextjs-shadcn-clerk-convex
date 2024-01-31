"use client";

import { useFocusRef } from "../hooks/useFocusRef";
import { CodeArea } from "../components/CodeArea";
import { HiddenCodeInput } from "../components/HiddenCodeInput";
import { TypedChars } from "../components/TypedChars";
import { NextChar } from "../components/NextChar";
import { IncorrectChars } from "../components/IncorrectChars";
import { UntypedChars } from "../components/UntypedChars";
import { useEffect, useState, useCallback, MouseEvent } from "react";
import { useIsPlaying } from "../hooks/useIsPlaying";
import { useKeyMap, triggerKeys } from "../hooks/useKeyMap";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useGameContext } from "@/components/providers/game-provider";

interface CodeTypingContainerProps {
  filePath: string;
  language: string;
}

const CODE_INPUT_BLUR_DEBOUNCE_MS = 1000;

let trulyFocusedCodeInput = true;

export function CodeTypingContainer({
  filePath,
  language,
}: CodeTypingContainerProps) {
  const { game, gameId } = useGameContext();

  const startTime = useMutation(api.games.start);

  const isPlaying = useIsPlaying();
  const index = game?.index ?? 0;
  const hasOpenModal = false;
  const [inputRef, triggerFocus] = useFocusRef<HTMLTextAreaElement>();
  const [focused, setFocused] = useState(true);

  useKeyMap(!hasOpenModal && !focused, triggerKeys, () => {
    triggerFocus();
    setFocused(true);
  });

  useEffect(() => {
    triggerFocus();
  }, [triggerFocus]);

  useEffect(() => {
    if (!isPlaying && index > 0 && gameId) {
      startTime({ gameId });
    }
  }, [index, isPlaying]);

  const onFocus = useCallback(() => {
    trulyFocusedCodeInput = true;
    setFocused(true);
  }, [setFocused]);

  const onBlur = useCallback(() => {
    trulyFocusedCodeInput = false;
    setTimeout(() => {
      if (!trulyFocusedCodeInput) {
        setFocused(false);
      }
    }, CODE_INPUT_BLUR_DEBOUNCE_MS);
  }, [setFocused]);

  // onBlur gets triggered when onFocus is also called more than once
  // which caused a flicker when you repeatedly click the code area
  // this will prevent onBlur from getting called repeatedly
  // Ref: https://github.com/react-toolbox/react-toolbox/issues/1323#issuecomment-656778859
  const onMouseDownPreventBlur = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
    },
    []
  );

  return (
    <div className="w-full relative" onClick={triggerFocus}>
      <div
        className="flex flex-col w-full"
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseDown={onMouseDownPreventBlur}
      >
        <HiddenCodeInput hide={true} disabled={false} inputRef={inputRef} />
        <CodeArea staticHeigh={false} filePath={filePath} focused={focused}>
          <TypedChars language={language} />
          <IncorrectChars />
          <NextChar focused={focused} />
          <UntypedChars />
        </CodeArea>
      </div>
    </div>
  );
}
