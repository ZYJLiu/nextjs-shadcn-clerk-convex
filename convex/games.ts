import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";
import { getCode } from "./code";
import { Id } from "./_generated/dataModel";

export const createGame = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const user = await getUser(ctx, identity.nickname!);
      if (user) {
        return ctx.db.insert("games", { userId: user._id });
      }
    }

    return ctx.db.insert("games", {});
  },
});

export const store = mutation({
  args: {
    key: v.string(),
    timestamp: v.number(),
    index: v.number(),
    correct: v.boolean(),
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const keystroke = {
      key: args.key,
      timestamp: args.timestamp,
      index: args.index,
      correct: args.correct,
    };
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Called storeUser without authentication present");
    // }

    // const user = await getUser(ctx, identity.nickname!);

    // if (user) {
    // const game = await getGame(ctx, user._id);

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return await ctx.db.patch(game._id, {
      keystroke: [...(game.keystroke || []), keystroke],
    });
    // } else {
    //   return await ctx.db.patch(args.gameId, {
    //     keystroke: [...(game.keystroke || []), keystroke],
    //   });
    // }
  },
});

export const start = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Called storeUser without authentication present");
    // }
    // const user = await getUser(ctx, identity.nickname!);

    // if (user) {
    const game = await ctx.db.get(args.gameId);
    const code = await getCode(ctx);
    if (game) {
      return await ctx.db.patch(game._id, {
        startTime: Date.now(),
        code: code?.code,
      });
    }
  },
});

export const reset = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Called storeUser without authentication present");
    // }
    // const user = await getUser(ctx, identity.nickname!);

    // if (user) {
    const game = await ctx.db.get(args.gameId);
    if (game) {
      return await ctx.db.patch(game._id, {
        startTime: undefined,
        code: undefined,
        keystroke: undefined,
      });
    }
  },
});

export const calculateGameResults = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Called storeUser without authentication present");
    // }
    // const user = await getUser(ctx, identity.nickname!);

    // if (user) {
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

// export const get = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Called storeUser without authentication present");
//     }
//     const user = await getUser(ctx, identity.nickname!);
//     if (!user) {
//       return;
//     }
//     return await getGame(ctx, user?._id as Id<"users">);
//   },
// });

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
