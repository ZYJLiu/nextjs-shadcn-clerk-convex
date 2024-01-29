import create from "zustand";
import { cpmToWPM } from "./cpmToWPM";

const codeString = `const keypair = Keypair.generate();`;
// const codeString = `const keypair = Keypair.generate();

// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// const signature = await connection.requestAirdrop(
//   keypair.publicKey,
//   LAMPORTS_PER_SOL
// );`;

// const codeString = `use anchor_lang::prelude::*;

// declare_id!("...");

// #[program]
// pub mod counter {
//     use super::*;

//     pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
//         let counter = &ctx.accounts.counter;
//         msg!("Counter account created! Current count: {}", counter.count);
//         Ok(())
//     }

//     pub fn increment(ctx: Context<Increment>) -> Result<()> {
//         let counter = &mut ctx.accounts.counter;
//         msg!("Previous counter: {}", counter.count);
//         counter.count = counter.count.checked_add(1).unwrap();
//         msg!("Counter incremented! Current count: {}", counter.count);
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     #[account(
//         init,
//         payer = user,
//         space = 8 + 8
//     )]
//     pub counter: Account<'info, Counter>,
//     pub system_program: Program<'info, System>,
// }

// #[derive(Accounts)]
// pub struct Increment<'info> {
//     #[account(mut)]
//     pub counter: Account<'info, Counter>,
// }

// #[account]
// pub struct Counter {
//     pub count: u64,
// };`;

const snippet1 = `declare_id!("...");`;

const snippet2 = `#[program]
pub mod counter {
    use super::*;
}`;

const snippet3 = `pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
  let counter = &ctx.accounts.counter;
  msg!("Counter account created! Current count: {}", counter.count);
  Ok(())
}`;

const snippet4 = `pub fn increment(ctx: Context<Increment>) -> Result<()> {
  let counter = &mut ctx.accounts.counter;
  msg!("Previous counter: {}", counter.count);
  counter.count = counter.count.checked_add(1).unwrap();
  msg!("Counter incremented! Current count: {}", counter.count);
  Ok(())
}`;

const snippet5 = `#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + 8
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}`;

const snippet6 = `#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}`;

const snippet7 = `#[account]
pub struct Counter {
    pub count: u64,
};`;

const codeStrings = [
  codeString,
  // snippet1,
  // snippet2,
  // snippet3,
  // snippet4,
  // snippet5,
  // snippet6,
  // snippet7,
];

function getRandomCodeString() {
  const randomIndex = Math.floor(Math.random() * codeStrings.length);
  return codeStrings[randomIndex];
}

export interface KeyStroke {
  key: string;
  timestamp: number;
  index: number;
  correct: boolean;
}

interface CodeState {
  // Match state
  startTime?: Date;
  endTime?: Date;
  keyStrokes: KeyStroke[];
  // TODO: Can we move match state to GameState
  // perhaps start and end time can be set from backend events
  start: () => void;
  end: () => void;
  isPlaying: () => boolean;
  getChartWPM: () => number[];
  _getValidKeyStrokes: () => KeyStroke[];
  _getIncorrectKeyStrokes: () => KeyStroke[];

  // Code rendering state
  code: string;
  index: number;
  correctIndex: number;
  correctChars: () => string;
  incorrectChars: () => string;
  currentChar: () => string;
  untypedChars: () => string;
  initialize: (code: string) => void;
  handleBackspace: () => void;
  handleKeyPress: (keyStroke: KeyStroke) => void;
  keyPressFactory: (key: string) => KeyStroke;
  isCompleted: () => boolean;
  correctInput: () => string;
  // private helper methods
  _getBackspaceOffset: () => number;
  _getForwardOffset: () => number;
  _allCharsTyped: () => boolean;
  calculateResults: () => {
    timeMS: number;
    cpm: number;
    mistakes: number;
    accuracy: number;
  } | null;
  reset: () => void;
}

// There are 3 separate parts of logic in this store
// 1. Code rendering logic which is necessary to render the code strings
// 2. Match logic which concerns itself with maintaining the match
// 3. Results logic which shows data after the race
// Match logic depends on code rendering logic.
// Results logic depends on Match logic.
// Perhaps Match and results logic could be split into a separate store
// But this was a bit simpler as we can just push to keyStrokes from the handleKeyPress method
// The other option would be to pass in the saveKeyStroke method into the handleKeyPress method

export const useCodeStore = create<CodeState>((set, get) => ({
  // RESULTS logic
  getChartWPM: () => {
    const startTime = get().startTime?.getTime();
    if (!startTime) {
      return [];
    }
    const wpm = [];
    let count = 0;
    let seconds = 1;
    const validKeyStrokes = get()._getValidKeyStrokes();

    for (let i = 0; i < validKeyStrokes.length; i++) {
      const keyStroke = validKeyStrokes[i];
      const breaktime = startTime + seconds * 1000;
      const isLastKeyStroke = i === validKeyStrokes.length - 1;
      const diffMS = keyStroke.timestamp - breaktime;
      const diffSeconds = diffMS / 1000;
      if (keyStroke.timestamp > breaktime) {
        // If more than a second has passed since the last WPM calculation
        // we push another WPM calculation to the array
        const cpm = Math.floor((60 * count) / (seconds + diffSeconds));
        wpm.push(cpmToWPM(cpm));
        seconds++;
      } else if (isLastKeyStroke) {
        // if this is the last keystroke in the valid keystrokes array
        // we push the last uncounted characters as CPM to the array
        // even if we have not passed a full second
        const cpm = Math.floor((60 * count) / (seconds + diffSeconds));
        wpm.push(cpmToWPM(cpm));
        seconds++;
      }
      count++;
    }
    return wpm;
  },
  // BUG: this suffers from the same bug as backend used to suffer from.
  // It's not as bad because it's used only to render the chart
  // See: RacePlayer.validKeyStrokes()
  // we should completely remove this method and rely on the backend to get the valid keystrokes
  // this way we only need the calculation in one place
  _getValidKeyStrokes: () => {
    const keyStrokes = get().keyStrokes;
    const validKeyStrokes = Object.values(
      Object.fromEntries(
        keyStrokes
          .filter((stroke) => stroke.correct)
          .map((keyStroke) => [keyStroke.index, keyStroke])
      )
    );
    return validKeyStrokes;
  },
  _getIncorrectKeyStrokes: () => {
    const keyStrokes = get().keyStrokes;
    return keyStrokes.filter((stroke) => !stroke.correct);
  },
  // MATCH logic
  keyStrokes: [],
  incorrectKeyStrokes: [],
  start: () => {
    set((state) => {
      return { ...state, startTime: new Date() };
    });
  },
  end: () => {
    set((state) => {
      return { ...state, endTime: new Date() };
    });
  },
  isPlaying: () => {
    return !!get().startTime && !get().endTime;
  },
  // CODE rendering logic
  code: getRandomCodeString(),
  index: 0,
  correctIndex: 0,
  initialize: (code: string) => {
    set((state) => ({
      ...state,
      code,
      index: 0,
      correctIndex: 0,
      startTime: undefined,
      endTime: undefined,
      chars: [],
      keyStrokes: [],
    }));
  },
  handleBackspace: () => {
    set((state) => {
      const offset = state._getBackspaceOffset();
      const index = Math.max(state.index - offset, 0);
      const correctIndex = Math.min(index, state.correctIndex);
      return { ...state, index, correctIndex };
    });
  },
  keyPressFactory: (unparsedKey: string) => {
    const key = parseKey(unparsedKey);
    const offset = get()._getForwardOffset();
    const index = Math.min(offset + get().index, get().code.length);
    // BUG: "correct" below is a bug
    // if index i-1 is not correct this calculation can evaluate index i to be correct
    // this is addressed in the backend but should also be fixed here...
    // or perhaps removed compleptely and we can rely on the backend calculation with appropriate text coverage
    const correct =
      get().index === get().correctIndex && key === get().code[get().index];
    const keyStroke = {
      key,
      index,
      timestamp: new Date().getTime(),
      correct,
    };
    return keyStroke;
  },
  handleKeyPress: (keyStroke: KeyStroke) => {
    set((state) => {
      if (isSkippable(keyStroke.key)) return state;
      if (state._allCharsTyped()) return state;
      const index = keyStroke.index;
      const correctIndex = !keyStroke.correct ? state.correctIndex : index;
      state.keyStrokes.push(keyStroke);
      return { ...state, index, correctIndex };
    });
  },
  correctChars: () => {
    return get().code.slice(0, get().correctIndex);
  },
  currentChar: () => {
    if (get().code.length <= get().index) {
      return "";
    }
    return get().code[get().index];
  },
  incorrectChars: () => {
    if (get().code.length <= get().index) {
      return get().code.slice(get().correctIndex);
    }
    return get().code.slice(get().correctIndex, get().index);
  },
  untypedChars: () => {
    if (get().code.length <= get().index) {
      return "";
    }
    return get().code.slice(get().index + 1);
  },
  correctInput: () => {
    return get().code.substring(0, get().correctIndex);
  },
  isCompleted: () => {
    return get().correctIndex > 0 && get().correctIndex === get().code.length;
  },
  _allCharsTyped: () => {
    return get().index === get().code.length;
  },
  _getForwardOffset: () => {
    let offset = 1;

    // if current char is a line break \n:
    if (isLineBreak(get().currentChar())) {
      // skip repeated spaces
      while (get().code[get().index + offset] === " ") {
        offset++;
      }
    }

    // TODO: move this logic to parsing in order to remove too many spaces
    // if next char and next next char are going to be a space:
    // else if (
    //   isSpace(get().code[get().index + 1]) &&
    //   isSpace(get().code[get().index + 2])
    // ) {
    //   // skip repeated spaces
    //   while (get().code[get().index + offset] === " ") {
    //     offset++;
    //   }
    // }

    return offset;
  },
  _getBackspaceOffset: () => {
    let offset = 1;
    // if previous char and previous previous char is a space:
    if (
      get().code[get().index - 1] === " " &&
      get().code[get().index - 2] === " "
    ) {
      while (get().code[get().index - offset] === " ") {
        offset++;
      }
    }
    return offset;
  },
  calculateResults: () => {
    const startTime = get().startTime;
    const keyStrokes = get().keyStrokes;
    if (!startTime) return null;

    const timeMS = ResultCalculationService.getTimeMS(startTime, keyStrokes);
    const cpm = ResultCalculationService.getCPM(get().code, timeMS);
    const mistakes = ResultCalculationService.getMistakesCount(keyStrokes);
    const accuracy = ResultCalculationService.getAccuracy(keyStrokes);

    return { timeMS, cpm, mistakes, accuracy };
  },
  reset: () => {
    set((state) => ({
      ...state,
      startTime: undefined,
      endTime: undefined,
      keyStrokes: [],
      code: getRandomCodeString(),
      index: 0,
      correctIndex: 0,
    }));
  },
}));

export enum TrackedKeys {
  Backspace = "Backspace",
}

function isLineBreak(key: string) {
  return key === "\n";
}

function parseKey(key: string) {
  switch (key) {
    case "Enter":
      return "\n";
    default:
      return key;
  }
}

export function isSkippable(key: string) {
  switch (key) {
    case "Shift":
    case "OS":
    case "Control":
      return true;
    default:
      return false;
  }
}

export class ResultCalculationService {
  static getTimeMS(startTime: Date, keyStrokes: KeyStroke[]): number {
    const firstTimeStampMS = startTime.getTime();
    const lastTimeStampMS = keyStrokes[keyStrokes.length - 1].timestamp;
    return lastTimeStampMS - firstTimeStampMS;
  }

  static getCPM(code: string, timeMS: number): number {
    const timeSeconds = timeMS / 1000;
    const strippedCode = this.getStrippedCode(code);
    const cps = strippedCode.length / timeSeconds;
    return Math.floor(cps * 60);
  }

  static getMistakesCount(keyStrokes: KeyStroke[]): number {
    return keyStrokes.filter((stroke) => !stroke.correct).length;
  }

  static getAccuracy(keyStrokes: KeyStroke[]): number {
    const validKeyStrokes = keyStrokes.filter(
      (stroke) => stroke.correct
    ).length;
    const totalKeyStrokes = keyStrokes.length;
    return Math.floor((validKeyStrokes / totalKeyStrokes) * 100);
  }

  static getStrippedCode(code: string): string {
    const strippedCode = code
      .split("\n")
      .map((subText) => subText.trimStart())
      .join("\n");
    return strippedCode;
  }
}
