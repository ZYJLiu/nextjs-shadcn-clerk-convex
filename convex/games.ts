import { v } from "convex/values";
import { QueryCtx, MutationCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

// Handle key press and backspace
export const key = mutation({
  args: {
    key: v.string(),
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    console.log("key", args.key);

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const backspaces = game.input!.length - args.key.length;

    if (backspaces > 0) {
      await handleBackspaces(ctx, game, args.key, backspaces);
    } else {
      await handleKeyStrokes(ctx, game, args.key);
    }
  },
});

async function handleBackspaces(
  ctx: MutationCtx,
  game: Doc<"games">,
  key: string,
  backspaces: number
) {
  console.log("BACKSPACE");
  for (let i = 1; i <= backspaces; i++) {
    const { index, correctIndex } = handleBackspace(
      game.code!,
      game.index!,
      game.correctIndex!
    );

    const { correctChars, untypedChars, currentChar, incorrectChars } =
      getCharDetails(game.code!, index, correctIndex);

    await ctx.db.patch(game._id, {
      input: key,
      index,
      correctIndex,
      correctChars,
      untypedChars,
      currentChar,
      incorrectChars,
    });
  }
}

async function handleKeyStrokes(
  ctx: MutationCtx,
  game: Doc<"games">,
  key: string
) {
  const typed = key.substring(game.input!.length);
  console.log("KEYSTROKE", typed);
  for (const char of typed) {
    if (isSkippable(char)) continue;

    const incorrectChar = getIncorrectChars(
      game.code!,
      game.index!,
      game.correctIndex!
    );

    if (incorrectChar.length > 0) {
      console.log("INCORRECT CHAR");
      await ctx.db.patch(game._id, {
        incorrectChars: incorrectChar,
        input: key,
      });
      // If there's already an incorrect character, ignore further input
      break;
    }

    const keyPress = keyPressFactory(
      char,
      game.code!,
      game.index!,
      game.correctIndex!
    );

    const { correctIndex } = handleKeyPress(keyPress, game.correctIndex!);

    const { correctChars, untypedChars, currentChar, incorrectChars } =
      getCharDetails(game.code!, keyPress.index, correctIndex);

    await ctx.db.patch(game._id, {
      input: key,
      index: keyPress.index,
      correctIndex: correctIndex,
      keystroke: [...(game.keystroke || []), keyPress],
      correctChars,
      untypedChars,
      currentChar,
      incorrectChars,
    });
  }
}

export const start = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);

    if (game) {
      return await ctx.db.patch(game._id, {
        startTime: Date.now(),
      });
    }
  },
});

export const end = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);

    if (game) {
      return await ctx.db.patch(game._id, {
        endTime: Date.now(),
      });
    }
  },
});

// update game code
export const code = mutation({
  args: { gameId: v.optional(v.id("games")), code: v.string() },
  handler: async (ctx, args) => {
    if (!args.gameId) {
      return null;
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    const { correctChars, untypedChars, currentChar } = getCharDetails(
      args.code,
      0,
      0
    );

    return await ctx.db.patch(game._id, {
      code: args.code,
      correctChars,
      untypedChars,
      currentChar,
      index: 0,
      correctIndex: 0,
    });
  },
});

export const create = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const { correctChars, untypedChars, currentChar } = getCharDetails(
      args.code,
      0,
      0
    );

    const identity = await ctx.auth.getUserIdentity();
    let userId = undefined;

    if (identity) {
      const user = await getUser(ctx, identity.nickname!);
      if (user) {
        userId = user._id;
      }
    }

    return ctx.db.insert("games", {
      userId,
      startTime: undefined,
      endTime: undefined,
      code: args.code,
      keystroke: [],
      input: "",
      incorrectChars: "",
      correctChars,
      untypedChars,
      currentChar,
      index: 0,
      correctIndex: 0,
    });
  },
});

export const reset = mutation({
  args: { gameId: v.id("games"), code: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    const { correctChars, untypedChars, currentChar } = getCharDetails(
      args.code,
      0,
      0
    );

    return await ctx.db.patch(game._id, {
      startTime: undefined,
      endTime: undefined,
      code: args.code,
      keystroke: [],
      input: "",
      incorrectChars: "",
      correctChars,
      untypedChars,
      currentChar,
      index: 0,
      correctIndex: 0,
    });
  },
});

export const calculateGameResults = query({
  args: { gameId: v.optional(v.id("games")) },
  handler: async (ctx, args) => {
    if (!args.gameId) {
      return null;
    }
    const game = await ctx.db.get(args.gameId);
    if (game && game.startTime && game.keystroke && game.code) {
      // Calculate the results
      const timeMS = getTimeMS(
        new Date(game.startTime as number),
        game.keystroke!
      );
      const wpm = getWPM(game.code!, timeMS);
      const mistakes = getMistakesCount(game.keystroke!);
      const accuracy = getAccuracy(game.keystroke!);

      // Return the calculated results
      return { timeMS, wpm, mistakes, accuracy };
    }
  },
});

// export const get = mutation({
//   args: { gameId: v.optional(v.id("games")) },
//   handler: async (ctx, args) => {
//     if (!args.gameId) {
//       return null;
//     }
//     const game = await ctx.db.get(args.gameId);
//     return game;
//   },
// });

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    return game;
  },
});

export async function getGame(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("games")
    .withIndex("byUserId", (q) => q.eq("userId", userId))
    .unique();
}

export interface KeyStroke {
  key: string;
  timestamp: number;
  index: number;
  correct: boolean;
}

function getTimeMS(startTime: Date, keyStrokes: KeyStroke[]): number {
  const firstTimeStampMS = startTime.getTime();
  const lastTimeStampMS = keyStrokes[keyStrokes.length - 1].timestamp;
  return lastTimeStampMS - firstTimeStampMS;
}

function getWPM(code: string, timeMS: number): number {
  const timeSeconds = timeMS / 1000;
  const strippedCode = getStrippedCode(code);
  const cps = strippedCode.length / timeSeconds;
  const cpm = Math.floor(cps * 60);
  const wpm = Math.floor(cpm / 5);
  return wpm;
}

function getMistakesCount(keyStrokes: KeyStroke[]): number {
  return keyStrokes.filter((stroke) => !stroke.correct).length;
}

function getAccuracy(keyStrokes: KeyStroke[]): number {
  const validKeyStrokes = keyStrokes.filter((stroke) => stroke.correct).length;
  const totalKeyStrokes = keyStrokes.length;
  return Math.floor((validKeyStrokes / totalKeyStrokes) * 100);
}

function getStrippedCode(code: string): string {
  const strippedCode = code
    .split("\n")
    .map((subText) => subText.trimStart())
    .join("\n");
  return strippedCode;
}

function handleBackspace(
  code: string,
  currentIndex: number,
  correctIndex: number
): { index: number; correctIndex: number } {
  const offset = getBackspaceOffset(code, currentIndex);
  const newIndex = Math.max(currentIndex - offset, 0);
  const newCorrectIndex = Math.min(newIndex, correctIndex);

  return { index: newIndex, correctIndex: newCorrectIndex };
}

function getBackspaceOffset(code: string, index: number): number {
  let offset = 1;
  // Check if the previous char and the one before it are spaces
  if (index > 1 && code[index - 1] === " " && code[index - 2] === " ") {
    while (index - offset >= 0 && code[index - offset] === " ") {
      offset++;
    }
  }
  return offset;
}

function getIncorrectChars(
  code: string,
  currentIndex: number,
  correctIndex: number
): string {
  if (code.length <= currentIndex) {
    return code.slice(correctIndex);
  }
  return code.slice(correctIndex, currentIndex);
}

function getCorrectChars(code: string, correctIndex: number): string {
  return code.slice(0, correctIndex);
}

function getUntypedChars(code: string, index: number): string {
  if (code.length <= index) {
    return "";
  }
  return code.slice(index + 1);
}

function getCurrentChar(code: string, index: number): string {
  if (code.length <= index) {
    return "";
  }
  return code[index];
}

function getCharDetails(
  code: string,
  currentIndex: number,
  correctIndex: number
) {
  const correctChars = getCorrectChars(code, correctIndex);
  const untypedChars = getUntypedChars(code, currentIndex);
  const currentChar = getCurrentChar(code, currentIndex);
  const incorrectChars = getIncorrectChars(code, currentIndex, correctIndex);

  return {
    correctChars,
    untypedChars,
    currentChar,
    incorrectChars,
  };
}

function keyPressFactory(
  unparsedKey: string,
  code: string,
  currentIndex: number,
  correctIndex: number
): { key: string; index: number; timestamp: number; correct: boolean } {
  const key = parseKey(unparsedKey);
  const offset = getForwardOffset(code, currentIndex);
  const index = Math.min(offset + currentIndex, code.length);
  const correct = currentIndex === correctIndex && key === code[currentIndex];

  const keyStroke = {
    key,
    index,
    timestamp: Date.now(),
    correct,
  };

  return keyStroke;
}

function getForwardOffset(code: string, index: number): number {
  let offset = 1;

  // Check if current char is a line break
  if (index < code.length && isLineBreak(code[index])) {
    // Skip repeated spaces after the line break
    while (index + offset < code.length && code[index + offset] === " ") {
      offset++;
    }
  }

  return offset;
}

function handleKeyPress(
  keyStroke: KeyStroke,
  currentCorrectIndex: number
): {
  correctIndex: number;
} {
  if (isSkippable(keyStroke.key)) {
    return { correctIndex: currentCorrectIndex };
  }

  const index = keyStroke.index;
  const correctIndex = !keyStroke.correct ? currentCorrectIndex : index;

  return {
    correctIndex,
  };
}

function isSkippable(key: string) {
  switch (key) {
    case "Shift":
    case "OS":
    case "Control":
      return true;
    default:
      return false;
  }
}

function parseKey(key: string) {
  switch (key) {
    case "Enter":
      return "\n";
    default:
      return key;
  }
}

function isLineBreak(key: string) {
  return key === "\n";
}

// export const key = mutation({
//   args: {
//     key: v.string(),
//     gameId: v.id("games"),
//   },
//   handler: async (ctx, args) => {
//     console.log("key", args.key);

//     const game = await ctx.db.get(args.gameId);
//     if (!game) {
//       throw new Error("Game not found");
//     }

//     const backspaces = game.input!.length - args.key.length;

//     if (backspaces > 0) {
//       console.log("BACKSPACE");
//       for (let i = 1; i <= backspaces; i++) {
//         const { index, correctIndex } = handleBackspace(
//           game.code!,
//           game.index!,
//           game.correctIndex!
//         );

//         const { correctChars, untypedChars, currentChar, incorrectChars } =
//           getCharDetails(game.code!, index, correctIndex);

//         await ctx.db.patch(game._id, {
//           input: args.key,
//           index,
//           correctIndex,
//           correctChars,
//           untypedChars,
//           currentChar,
//           incorrectChars,
//         });
//       }
//     } else {
//       console.log("NOT BACKSPACE");

//       const typed = args.key.substring(game.input!.length);
//       console.log("typed", typed);
//       for (const char of typed) {
//         if (isSkippable(char)) continue;

//         const incorrectChar = getIncorrectChars(
//           game.code!,
//           game.index!,
//           game.correctIndex!
//         );

//         if (incorrectChar.length > 0) {
//           console.log("INCORRECT CHAR");
//           await ctx.db.patch(game._id, {
//             incorrectChars: incorrectChar,
//             input: args.key,
//           });
//           // If there's already an incorrect character, ignore further input
//           break;
//         }

//         const keyPress = keyPressFactory(
//           char,
//           game.code!,
//           game.index!,
//           game.correctIndex!
//         );

//         const { correctIndex } = handleKeyPress(keyPress, game.correctIndex!);

//         const { correctChars, untypedChars, currentChar, incorrectChars } =
//           getCharDetails(game.code!, keyPress.index, correctIndex);

//         await ctx.db.patch(game._id, {
//           input: args.key,
//           index: keyPress.index,
//           correctIndex: correctIndex,
//           keystroke: [...(game.keystroke || []), keyPress],
//           correctChars,
//           untypedChars,
//           currentChar,
//           incorrectChars,
//         });
//       }
//     }
//   },
// });

//
