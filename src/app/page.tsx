"use client";

import Leaderboard from "@/components/leaderboard";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameStore, useStore } from "@/stores/clientStore";
import { LogInIcon, PlayIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { CiCircleQuestion } from "react-icons/ci";

export default function Home() {
  let router = useRouter();
  let toggleHelpMenu = useStore((state) => state.toggleHelpMenu);
  let gameStore = useGameStore();
  let { data: session, status } = useSession();
  const { data: leaderboard, isLoading: leaderboardLoading } = useSWR<{
    data: {
      name: string;
      time: number;
      image: string;
    }[];
  }>("/api/leaderboard");

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div
        className="h-full w-full"
        style={{
          backgroundImage: 'url("/background-image.png")',
          backgroundSize: "cover", // Cover the entire div
          backgroundPosition: "center",
        }}
      >
        <div className="flex justify-center items-center h-full flex-col">
          <div className="rounded-lg p-6 w-80 gap-3 flex justify-center flex-col">
            {!session ? (
              status === "loading" ? (
                <Button
                  size={"lg"}
                  variant={"secondary"}
                  className="flex gap-3 text-lg p-3"
                  onClick={() => {}}
                  disabled
                >
                  <PlayIcon /> Play Now
                </Button>
              ) : (
                <Button
                  size={"lg"}
                  variant={"secondary"}
                  className="flex gap-3 text-lg p-3"
                  onClick={() => {
                    router.push("/signin");
                  }}
                >
                  <LogInIcon /> Sign In To Play
                </Button>
              )
            ) : (
              <Button
                size={"lg"}
                variant={"secondary"}
                className="flex gap-3 text-lg p-3"
                onClick={() => {
                  gameStore.endGame();
                  router.push("/play");                  
                }}
              >
                <PlayIcon /> Play Now
              </Button>
            )}
            <Button
              size={"lg"}
              className="flex gap-3 text-lg p-3"
              onClick={toggleHelpMenu}
            >
              <CiCircleQuestion size={32} />
              How to Play?
            </Button>
          </div>
          {!leaderboardLoading && leaderboard != null ? (
            <Leaderboard
              players={leaderboard.data.map((player) => ({
                avatar: player.image,
                name: player.name,
                time: player.time,
              }))}
            />
          ) : (
            <div className="relative rounded-3xl">
              <Skeleton className="w-80 h-96 backdrop-blur-md rounded-3xl" />
              <div className="absolute inset-0 animate-pulse bg-white opacity-30 rounded-3xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
