import { useGame } from "../hooks/useGame";
import { useCodeStore } from "../state/code-store";

function isOnlySpace(str: string) {
  return str.trim().length === 0;
}

export function IncorrectChars() {
  const game = useGame();
  // const incorrectChars = useCodeStore((state) => state.incorrectChars);
  const incorrectChars = () => game?.incorrectChars ?? "";
  const charGroups = parseIncorrectCharGroups(incorrectChars());
  return (
    <>
      {charGroups.map((chars, index) => {
        const bgColor =
          isOnlySpace(chars) && chars.length > 1 ? "" : "bg-red-500";
        return (
          <span key={index} className={`${bgColor} pb-1 pt-2`}>
            {chars}
          </span>
        );
      })}
    </>
  );
}

const LineBreak = "\n";
const LineBreakChar = "↵";
const LineBreakWithChar = `${LineBreakChar}${LineBreak}`;

function parseIncorrectCharGroups(incorrectChars: string) {
  const incorrectLines = incorrectChars
    .replaceAll(LineBreak, LineBreakWithChar)
    .split("\n")
    .filter(Boolean);

  const charGroups = incorrectLines
    .map((line) => {
      const subline = line.split(/(\s+)/);
      return subline.map((chars) => {
        return chars.replaceAll(LineBreakChar, LineBreakWithChar);
      });
    })
    .flat();
  return charGroups;
}
