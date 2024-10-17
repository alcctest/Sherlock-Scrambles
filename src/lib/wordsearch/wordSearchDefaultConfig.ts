export interface WordSearchConfig {
  cols: number;
  rows: number;
  disabledDirections: Array<"N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW">;
  allowedDirections: Array<"N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW">;
  dictionary: string[];
  maxWords: number;
  backwardsProbability: number;
  upperCase: boolean;
  diacritics: boolean;
  forbiddenWords: string[];
  maxRetries: number;
}

const wordSearchConfig: WordSearchConfig = {
  cols: 10,
  rows: 10,
  disabledDirections: [],
  allowedDirections: ["N", "S", "E", "W", "NE", "NW", "SE", "SW"],
  dictionary: [],
  maxWords: 20,
  backwardsProbability: 0.3,
  upperCase: true,
  diacritics: false,
  forbiddenWords: [],
  maxRetries: 10,
};

export default wordSearchConfig;
