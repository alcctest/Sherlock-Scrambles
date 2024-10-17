import { shuffle, merge, difference, cloneDeep } from "lodash";
import * as utils from "./utils";
import defaultSettings, { WordSearchConfig } from "./wordSearchDefaultConfig";    
import { Position } from "./utils";

interface Word {
    word: string;
    clean: string;
    path: Position[];
}

class WordSearch {
    settings: WordSearchConfig;
    forbiddenWordsFound: string[] = [];
    data: { grid: string[][]; words: Word[] };

    constructor(options: Partial<WordSearchConfig> = {}) {
        this.settings = merge(cloneDeep(defaultSettings), cloneDeep(options));
        this.settings.allowedDirections = difference(
            this.settings.allowedDirections,
            this.settings.disabledDirections
        );
        this.data = this.buildGame();
    }

    get grid(): string[][] {
        return cloneDeep(this.data.grid);
    }

    get words(): Word[] {
        return cloneDeep(this.data.words);
    }

    get cleanForbiddenWords(): string[] {
        return cloneDeep(this.settings.forbiddenWords).map(w => this.cleanWord(w));
    }

    get forbiddenWordsIncluded(): string[] {
        return cloneDeep(this.forbiddenWordsFound);
    }

    get defaultSettings(): WordSearchConfig {
        return cloneDeep(defaultSettings);
    }

    get utils() {
        return utils;
    }

    buildGame(retries: number = 0): { grid: string[][]; words: Word[], solutions: { [key: string]: Position[] } } {
        let grid = utils.createGrid(this.settings.cols, this.settings.rows);
        const addedWords: Word[] = [];
        const dict = shuffle(this.settings.dictionary);

        dict.forEach(word => {
            const clean = this.cleanWord(word);
            if (this.cleanForbiddenWords.some(fw => clean.includes(fw))) {
                return;
            }
            if (addedWords.length < this.settings.maxWords) {
                const path = utils.findPathInGrid(
                    clean,
                    grid,
                    this.settings.allowedDirections,
                    this.settings.backwardsProbability
                );
                if (path !== null) {
                    grid = utils.addWordToGrid(clean, path, grid);
                    addedWords.push({ word, clean, path });
                }
            }
        });

        addedWords.sort((a, b) => (a.clean > b.clean ? 1 : -1));
        grid = utils.fillGrid(grid, this.settings.upperCase);
        let solutions: {[key: string]: Position[]} ={} ;
        addedWords.forEach(item => {
            solutions[item.word] = item.path;
        });

        if (this.cleanForbiddenWords.length) {
            const forbiddenWordsFound = utils.filterWordsInGrid(this.cleanForbiddenWords, grid);
            if (forbiddenWordsFound.length) {
                if (retries < this.settings.maxRetries) {
                    return this.buildGame(retries + 1);
                } else {
                    this.forbiddenWordsFound = forbiddenWordsFound;
                }
            }
        }

        return { grid, words: addedWords, solutions };
    }

    cleanWord(word: string): string {
        return utils.normalizeWord(
            word,
            this.settings.upperCase,
            this.settings.diacritics
        );
    }

    dump() {
        return cloneDeep({ settings: this.settings, data: this.data });
    }

    load(config: Partial<WordSearch>) {
        merge(this, config);
        return this;
    }

    read(start: Position, end: Position): string | null {
        const path = utils.createPathFromPair(start, end);
        if (path) {
            return path.map(pos => this.data.grid[pos.y][pos.x]).join("");
        }
        return null;
    }

    toString(): string {
        return this.data.grid.map(l => l.join(" ")).join("\n");
    }
}

export default WordSearch;

