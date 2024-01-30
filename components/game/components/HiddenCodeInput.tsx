import { ChangeEvent, ClipboardEvent, KeyboardEvent, MouseEvent } from "react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGame } from "../hooks/useGame";

interface HiddenCodeInputProps {
  hide: boolean; // Used for debugging the input
  disabled: boolean;
  inputRef: (node: HTMLTextAreaElement) => void;
}

export const HiddenCodeInput = ({
  disabled,
  hide,
  inputRef,
}: HiddenCodeInputProps) => {
  const { gameId } = useGame();
  const key = useMutation(api.games.key);

  async function handleOnChange(e: ChangeEvent<HTMLTextAreaElement>) {
    key({ gameId, key: e.target.value });
  }

  return (
    <textarea
      className="text-white"
      ref={inputRef}
      autoFocus
      disabled={disabled}
      onChange={handleOnChange}
      onKeyDown={preventArrowKeys}
      onClick={preventClick}
      onPaste={preventPaste}
      style={{
        ...(false
          ? {
              position: "absolute",
              left: "-10000000px",
            }
          : {}),
      }}
    />
  );
};

function preventClick(e: MouseEvent<HTMLTextAreaElement>) {
  e.preventDefault();
}

function preventPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
  e.preventDefault();
}

function preventArrowKeys(e: KeyboardEvent<HTMLTextAreaElement>) {
  switch (e.key) {
    case ArrowKey.Up:
    case ArrowKey.Down:
    case ArrowKey.Left:
    case ArrowKey.Right:
      e.preventDefault();
  }
}

enum ArrowKey {
  Up = "ArrowUp",
  Down = "ArrowDown",
  Left = "ArrowLeft",
  Right = "ArrowRight",
}
