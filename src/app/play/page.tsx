"use client";

import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WordSearchGame } from "@/components/WordSearch";
import { useGameStore, useLeaderboardStore } from "@/stores/clientStore";
import { HeartIcon, LoaderIcon, LogInIcon, PlayIcon } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaHeart, FaHeartCrack } from "react-icons/fa6";
import useSWR from "swr";
function millisToMinutesAndSeconds(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format minutes and seconds to be two digits
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
export default function PlayPage() {
  let { data: session, status } = useSession();
  let router = useRouter();
  let {
    data: attemptData,
    isLoading,
    error,
  } = useSWR<{
    data: {
      attempts: number;
    };
  }>("/api/attempt");
  let gameStore = useGameStore();
  let leaderboardStore = useLeaderboardStore();

  // Use a useEffect to handle redirection and avoid setState during render
  useEffect(() => {
    if (error || status === "unauthenticated") {
      router.push("/signin");
    }
  }, [error, status, router]);

  if (isLoading || status === "loading" || session == null || !attemptData) {
    return (
      <div className="flex h-screen justify-center items-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }
  console.log(gameStore);
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div
        className="min-h-full w-full"
        style={{
          backgroundImage: 'url("/background-image.png")',
          backgroundSize: "cover", // Cover the entire div
          backgroundPosition: "center",
        }}
      >
        <div className="flex justify-center items-center min-h-full flex-col">
          {!gameStore.isGameStarted && !gameStore.isGameEnded && (
            <div className="rounded-lg p-6 flex justify-center items-center flex-col w-full">
              <Card className="w-full md:w-[450px]">
                <CardHeader className="flex justify-center items-center text-center">
                  <CardTitle>Ready to Play?</CardTitle>
                  <CardDescription>
                    Buckle up! The fun is just starting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center flex-col flex-wrap items-center text-center">
                  <h4 className="text-lg font-bold mb-4">Attempts</h4>
                  <div className="flex space-x-2 text-[#3e1f0a]">
                    {Array.from(
                      { length: attemptData.data.attempts },
                      (_, index) => (
                        <FaHeart key={index} size={32} />
                      )
                    )}
                    {Array.from(
                      { length: 3 - attemptData.data.attempts },
                      (_, index) => (
                        <FaHeartCrack
                          key={index + attemptData.data.attempts}
                          size={32}
                        />
                      )
                    )}
                  </div>
                  {attemptData.data.attempts > 0 ? (
                    <div className="m-3">
                      <Button
                        size={"lg"}
                        variant={"default"}
                        className="flex gap-3 text-lg p-3"
                        disabled={gameStore.isLoading}
                        onClick={() => {
                          gameStore.setLoading(true);
                          fetch("/api/attempt", {
                            method: "POST",
                          })
                            .then((res) => res.json())
                            .then(
                              ({
                                data,
                              }: {
                                data: {
                                  grid: string[][];
                                  words: string[];
                                  xorKey: number[];
                                };
                              }) => {
                                gameStore.setLoading(false);
                                gameStore.startGame(
                                  true,
                                  data.words,
                                  data.grid,
                                  data.xorKey
                                );
                              }
                            );
                        }}
                      >
                        <PlayIcon /> Start Game
                      </Button>
                    </div>
                  ) : (
                    <div className="m-3">
                      <Button
                        size={"lg"}
                        variant={"default"}
                        className="flex gap-3 text-lg p-3"
                        disabled={true}
                      >
                        <FaHeartCrack size={24} /> No Attempts Left
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {gameStore.isGameStarted && !gameStore.isGameEnded && (
            <WordSearchGame
              key={1}
              grid={gameStore.grid}
              words={gameStore.wordPool}
            />
          )}
          {gameStore.isGameStarted && gameStore.isGameEnded && (
            <div className="flex md:flex-row">
              <Card className="w-full md:w-[450px]">
                <CardHeader className="flex justify-center items-center text-center">
                  <CardTitle>Congratulations!</CardTitle>
                  <CardDescription>
                    You've found all the words, well done Sherlock!
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center flex-col flex-wrap items-center text-center">
                  <h4 className="text-lg font-bold">Time Taken</h4>
                  <span className="mb-3 text-lg text-bold">
                    {millisToMinutesAndSeconds(
                      gameStore.endTime! - gameStore.startTime!
                    )}
                  </span>
                  <h4 className="text-lg font-bold">Attempt Position</h4>
                  <span className="mb-3 text-lg text-bold">
                    {leaderboardStore.currentPosition == -1
                      ? "Loading..."
                      : leaderboardStore.currentPosition.toString()}
                  </span>
                  <h4 className="text-lg font-bold">Best Position</h4>
                  <span className="mb-3 text-lg text-bold">
                    {leaderboardStore.bestPosition == -1
                      ? "Loading..."
                      : leaderboardStore.bestPosition == 0 ? "N/A" : leaderboardStore.bestPosition.toString()}
                  </span>
                  <h4 className="text-lg font-bold mb-4">Attempts</h4>
                  <div className="flex space-x-2 text-[#3e1f0a]">
                    {Array.from(
                      { length: attemptData.data.attempts },
                      (_, index) => (
                        <FaHeart key={index} size={32} />
                      )
                    )}
                    {Array.from(
                      { length: 3 - attemptData.data.attempts },
                      (_, index) => (
                        <FaHeartCrack
                          key={index + attemptData.data.attempts}
                          size={32}
                        />
                      )
                    )}
                  </div>
                  {attemptData.data.attempts > 0 ? (
                    <div className="m-3">
                      <Button
                        size={"lg"}
                        variant={"default"}
                        className="flex gap-3 text-lg p-3"
                        disabled={gameStore.isLoading}
                        onClick={() => {
                          gameStore.setLoading(true);
                          fetch("/api/attempt", {
                            method: "POST",
                          })
                            .then((res) => res.json())
                            .then(
                              ({
                                data,
                              }: {
                                data: {
                                  grid: string[][];
                                  words: string[];
                                  xorKey: number[];
                                };
                              }) => {
                                gameStore.reset();
                                gameStore.setLoading(false);
                                gameStore.startGame(
                                  true,
                                  data.words,
                                  data.grid,
                                  data.xorKey
                                );
                              }
                            );
                        }}
                      >
                        <PlayIcon /> Start Game
                      </Button>
                    </div>
                  ) : (
                    <div className="m-3">
                      <Button
                        size={"lg"}
                        variant={"default"}
                        className="flex gap-3 text-lg p-3"
                        disabled={true}
                      >
                        <FaHeartCrack size={24} /> No Attempts Left
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Image
                src="/character.png"
                alt="Sherlock Holmes"
                className="hidden md:block"
                width={300}
                height={600}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
