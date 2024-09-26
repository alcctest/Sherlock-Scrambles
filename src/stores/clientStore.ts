import { create } from "zustand";

type Store = {
  isHelpOpen: boolean;
  setIsHelpOpen: (value: boolean) => void;
  toggleHelpMenu: () => void;
};

type GameStore = {
  isGameStarted: boolean;
  xorKey: number[];
  wordPool: string[];
  alreadyFound: string[];
  grid: string[][];
  startTime?: number;
  endTime?: number;
  isLoading: boolean;
  startGame: (value: boolean, wordPool: string[], grid: string[][], xorKey: number[]) => void;
  endGame: () => number;
  checkWord: (word: string) => boolean;
  checkAlreadyFound: (word: string) => boolean;
  setLoading: (value: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  isHelpOpen: false,
  setIsHelpOpen: (value: boolean) => set({ isHelpOpen: value }),
  toggleHelpMenu: () => set((state) => ({ isHelpOpen: !state.isHelpOpen })),
}));

export const useGameStore = create<GameStore>((set, state) => ({
  isGameStarted: false,
  startTime: 0,
  wordPool: [],
  grid: [],
  endTime: 0,
  xorKey: [],
  startGame: (value: boolean, wordPool: string[], grid: string[][], xorKey: number[]) => {
    set({ isGameStarted: value, wordPool, startTime: Date.now(), grid, xorKey });
  },
  endGame: () => {
    let endTime = Date.now();
    let dataToSend = {
      time: endTime - (state().startTime || 0),
      foundWords: state().alreadyFound,
    }
    // convert dataToSend to bytes and encrypt it with xorKey
    let bytes = new TextEncoder().encode(JSON.stringify(dataToSend));
    let encryptedBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      encryptedBytes[i] = bytes[i] ^ state().xorKey[i % state().xorKey.length];
    }
    let encryptedBytesArray = Array.from(encryptedBytes);
    // send encryptedBytes to server
    fetch("/api/leaderboard", {
      method: "POST",
      body: JSON.stringify({ data: encryptedBytesArray }),
    });

    set({ isGameStarted: false, endTime, wordPool: [], grid: [] });
    return endTime;
  },
  alreadyFound: [],
  checkWord: (word: string) => {
    let found = state().wordPool.includes(word);
    console.log(found)
    if (found) {
      set((state) => ({ alreadyFound: [...state.alreadyFound, word] }));
    }
    return found;
  },
  checkAlreadyFound: (word: string) => {
    return state().alreadyFound.includes(word);
  },
  isLoading: false,
  setLoading: (value: boolean) => set({ isLoading: value }),
}));
