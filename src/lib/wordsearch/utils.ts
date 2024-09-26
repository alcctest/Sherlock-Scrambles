// import _inRange from "lodash/inRange";
// import _range from "lodash/range";
// import _fill from "lodash/fill";
// import _flatten from "lodash/flatten";
// import _random from "lodash/random";
// import _cloneDeep from "lodash/cloneDeep";
// import _shuffle from "lodash/shuffle";
// import diacritics from "diacritics";

import _ from "lodash";
import diacritics from "diacritics";
const { inRange: _inRange, range: _range, fill: _fill, flatten: _flatten, random: _random, cloneDeep: _cloneDeep, shuffle: _shuffle } = _;

export interface Position {
    x: number;
    y: number;
}

export interface Boundaries {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

/**
 * Returns an array of positions, following a direction from a starting point.
 */
const createPath = (x: number, y: number, dir: string, len: number): Position[] => {
    return Array(len - 1).fill(0).reduce<Position[]>((path, _, index) => {
        const { x: prevX, y: prevY } = path[index];
        return path.concat({
            x: prevX + (dir.includes("E") ? 1 : dir.includes("W") ? -1 : 0),
            y: prevY + (dir.includes("S") ? 1 : dir.includes("N") ? -1 : 0)
        });
    }, [{ x, y }]);
};

/**
 * Returns a path from a start position and an end position.
 */
const createPathFromPair = (start: Position, end: Position): Position[] | null => {
    const hDist = end.x - start.x;
    const vDist = end.y - start.y;
    const fn = (dir: string, len: number) => createPath(start.x, start.y, dir, len);

    if (hDist === vDist) {
        return vDist > 0 ? fn("SE", vDist + 1) : fn("NW", -vDist + 1);
    } else if (vDist === -hDist) {
        return vDist > 0 ? fn("SW", vDist + 1) : fn("NE", -vDist + 1);
    } else if (hDist === 0) {
        return vDist > 0 ? fn("S", vDist + 1) : fn("N", -vDist + 1);
    } else if (vDist === 0) {
        return hDist > 0 ? fn("E", hDist + 1) : fn("W", -hDist + 1);
    }
    return null;
};

/**
 * Returns the most extreme boundaries where a word can start.
 */
const getWordStartBoundaries = (wordLength: number, direction: string, cols: number, rows: number): Boundaries | null => {
    const res: Boundaries = {
        minX: 0,
        maxX: cols - 1,
        minY: 0,
        maxY: rows - 1
    };
    let badInput = false;

    direction.split("").forEach(d => {
        let props: Partial<Boundaries>;
        switch (d) {
            case "N":
                props = { minY: wordLength - 1, maxY: rows - 1 };
                break;
            case "S":
                props = { minY: 0, maxY: rows - wordLength };
                break;
            case "E":
                props = { minX: 0, maxX: cols - wordLength };
                break;
            case "W":
                props = { minX: wordLength - 1, maxX: cols - 1 };
                break;
            default:
                badInput = true;
                props = {};
        }
        Object.assign(res, props);
    });

    if (
        [res.minX, res.maxX].some(v => !_inRange(v, 0, cols + 1)) ||
        [res.minY, res.maxY].some(v => !_inRange(v, 0, rows + 1))
    ) {
        badInput = true;
    }

    return badInput ? null : res;
};

/**
 * Returns a normalized string with or without any accent.
 */
const normalizeWord = (word: string, upperCase: boolean = true, keepDiacritics: boolean = false): string => {
    let res = keepDiacritics ? word : diacritics.remove(word);
    return res[upperCase ? "toUpperCase" : "toLowerCase"]();
};

/**
 * Returns a random letter, uppercase or lowercase.
 */
const getRandomLetter = (upperCase: boolean): string => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    if (upperCase) {
        alphabet = alphabet.toUpperCase();
    }
    return alphabet[_random(alphabet.length - 1)];
};

/**
 * Returns a new grid with a word added in the given path.
 */
const addWordToGrid = (word: string, path: Position[], grid: string[][]): string[][] => {
    const updatedGrid = _cloneDeep(grid);
    path.forEach((pos, i) => (updatedGrid[pos.y][pos.x] = word[i]));
    return updatedGrid;
};

/**
 * Returns a new grid with the given dimensions, containing only ".".
 */
const createGrid = (cols: number, rows: number): string[][] => {
    const grid: string[][] = [];
    for (let y = 0; y < rows; y++) {
        const line: string[] = [];
        for (let x = 0; x < cols; x++) {
            line.push(".");
        }
        grid.push(line);
    }
    return grid;
};

/**
 * Returns a new grid after filling the given one's empty cells.
 */
const fillGrid = (grid: string[][], upperCase: boolean): string[][] => {
    return grid.map(row =>
        row.map(cell => (cell === "." ? getRandomLetter(upperCase) : cell))
    );
};

/**
 * Returns a random path for a word in a grid if it can find one.
 */
const findPathInGrid = (
    word: string,
    grid: string[][],
    allowedDirections: string[],
    backwardsProbability: number
): Position[] | null => {
    let foundPath;
    let path: Position[] | undefined;
    const tryBackwardsFirst = Math.random() < backwardsProbability;
    const directionsToTry = shuffleDirections(allowedDirections, tryBackwardsFirst);

    while (directionsToTry.length && !foundPath) {
        const direction = directionsToTry.shift()!;
        const boundaries = getWordStartBoundaries(word.length, direction, grid[0].length, grid.length);
        if (boundaries !== null) {
            const xToTry: number[] = _range(boundaries.minX, boundaries.maxX + 1);
            const yToTry: number[] = _range(boundaries.minY, boundaries.maxY + 1);
            const positionsToTry: Position[] = _shuffle(_flatten(xToTry.map((x: number) => yToTry.map((y: number) => ({ x, y })))));

            while (positionsToTry.length && !foundPath) {
                const { x, y } = positionsToTry.shift()!;
                let invalidSpot = false;
                path = createPath(x, y, direction, word.length);
                let i = 0;

                while (i < path.length && !invalidSpot) {
                    const letter = word[i];
                    if (![".", letter].includes(grid[path[i].y][path[i].x])) {
                        invalidSpot = true;
                    }
                    i++;
                }

                if (!invalidSpot) {
                    foundPath = path;
                }
            }
        }
    }

    return foundPath || null;
};

/**
 * Filters an array of words to only keep those found in a grid.
 */
function filterWordsInGrid(words: string[], grid: string[][]): string[] {
    const forwardSequences = getAllCharSequencesFromGrid(grid);
    const sequences = forwardSequences + "|" + forwardSequences.split("").reverse().join("");
    return words.filter(w => sequences.includes(w));
}

/**
 * Returns a pipe-separated String aggregating all character sequences found in the grid.
 */
function getAllCharSequencesFromGrid(grid: string[][]): string {
    const sequences: string[] = [];

    for (let y = 0; y < grid.length; y++) {
        sequences.push(
            grid[y].join(""),
            readPathFromGrid(0, y, "SE", Math.min(grid.length - y, grid[0].length), grid),
            readPathFromGrid(0, y, "NE", Math.min(y + 1, grid[0].length), grid)
        );
    }

    for (let x = 0; x < grid[0].length; x++) {
        sequences.push(grid.map(row => row[x]).join(""));
        if (x > 0) {
            sequences.push(
                readPathFromGrid(x, 0, "SE", Math.min(grid[0].length - x, grid.length), grid),
                readPathFromGrid(x, grid.length - 1, "NE", Math.min(grid[0].length - x, grid.length), grid)
            );
        }
    }

    return sequences.filter(x => x.length > 1).join("|");
}

/**
 * Returns a string obtained by reading len characters from a starting point following a direction.
 */
function readPathFromGrid(x: number, y: number, direction: string, len: number, grid: string[][]): string {
    const path = createPath(x, y, direction, len);
    return path.map(pos => grid[pos.y][pos.x]).join("");
}

function shuffleDirections(allowedDirections: string[], tryBackwardsFirst: boolean): string[] {
    const backwardsDirections = _shuffle(["N", "W", "NW", "SW"]);
    const forwardDirections = _shuffle(["S", "E", "NE", "SE"]);
    const allDirections = tryBackwardsFirst
        ? backwardsDirections.concat(forwardDirections)
        : forwardDirections.concat(backwardsDirections);
    return allDirections.filter((d: string) => allowedDirections.includes(d));
}

export {
    getWordStartBoundaries,
    createPath,
    createPathFromPair,
    normalizeWord,
    getRandomLetter,
    addWordToGrid,
    createGrid,
    fillGrid,
    findPathInGrid,
    filterWordsInGrid,
    getAllCharSequencesFromGrid,
};
