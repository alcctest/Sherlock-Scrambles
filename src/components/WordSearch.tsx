"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StopwatchComponent } from "./stopwatch";
import { useGameStore } from "@/stores/clientStore";
import { twMerge } from "tailwind-merge";

type WordSearchGameProps = {
  words: string[];
  grid: string[][];
};

export function WordSearchGame({ words, grid }: WordSearchGameProps) {
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<[number, number][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<[number, number] | null>(
    null
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const gameStore = useGameStore();

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent): [number, number] | null => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      const cellSize = rect.width / grid[0].length;
      const col = Math.floor((x - rect.left) / cellSize);
      const row = Math.floor((y - rect.top) / cellSize);
      return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length
        ? [row, col]
        : null;
    },
    [grid]
  );

  const handleSelectionStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const cell = getCellFromEvent(e);
      if (cell) {
        setIsSelecting(true);
        setSelectionStart(cell);
        setSelectedCells([cell]);
      }
    },
    [getCellFromEvent]
  );

  const handleSelectionMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (isSelecting && selectionStart) {
        const cell = getCellFromEvent(e);
        if (cell) {
          const [startRow, startCol] = selectionStart;
          const [row, col] = cell;
          const rowDiff = row - startRow;
          const colDiff = col - startCol;

          if (
            rowDiff === 0 ||
            colDiff === 0 ||
            Math.abs(rowDiff) === Math.abs(colDiff)
          ) {
            const newSelectedCells: [number, number][] = [];
            const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
            const rowStep = rowDiff / steps;
            const colStep = colDiff / steps;

            for (let i = 0; i <= steps; i++) {
              newSelectedCells.push([
                Math.round(startRow + i * rowStep),
                Math.round(startCol + i * colStep),
              ]);
            }

            setSelectedCells(newSelectedCells);
          }
        }
      }
    },
    [isSelecting, selectionStart, getCellFromEvent]
  );

  const handleSelectionEnd = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    try {
      const selectedWord = selectedCells
        .map(([row, col]) => grid[row][col])
        .join("");
      console.log("Selected word:", selectedWord);
      setSelectedCells([]);
      if (gameStore.checkWord(selectedWord)) {
        setFoundWords([...foundWords, selectedWord]);
        setFoundCells([...foundCells, ...selectedCells]);
        if (foundWords.length >= words.length - 1) {
          gameStore.endGame();
        }
      }
    } catch (ignored) {
      console.log(ignored);
    }
  }, [selectedCells, grid]);

  const isSelected = useCallback(
    (row: number, col: number) => {
      return selectedCells.some((cell) => cell[0] === row && cell[1] === col);
    },
    [selectedCells]
  );

  const isFound = useCallback(
    (row: number, col: number) => {
      return foundCells.some((cell) => cell[0] === row && cell[1] === col);
    },
    [foundCells]
  );

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <Card className="max-w-80 md:max-w-lg flex flex-col">
      <CardHeader>
        <StopwatchComponent />
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-wrap gap-1 md:gap-2">
          {words.map((word) => (
            <Badge
              key={word}
              variant={foundWords.includes(word) ? "default" : "outline"}
              className={foundWords.includes(word) ? "bg-blue-900" : ""}
            >
              {word}
            </Badge>
          ))}
        </div>
        <div
          ref={gridRef}
          className="grid gap-1 select-none"
          style={{
            gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          }}
          onMouseDown={handleSelectionStart}
          onMouseMove={handleSelectionMove}
          onMouseUp={handleSelectionEnd}
          onMouseLeave={handleSelectionEnd}
          onTouchStart={handleSelectionStart}
          onTouchMove={handleSelectionMove}
          onTouchEnd={handleSelectionEnd}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square flex items-center justify-center cursor-pointer text-primary font-bold text-xs md:text-lg rounded transition-colors duration-200
                  ${
                    isSelected(rowIndex, colIndex)
                      ? "bg-blue-500"
                      : isFound(rowIndex, colIndex)
                      ? "bg-green-500"
                      : "bg-background"
                  }`}
                aria-label={`${cell} at row ${rowIndex + 1}, column ${
                  colIndex + 1
                }`}
              >
                {cell}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
