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
                  className="flex gap-3 h-14 rounded-full px-8 text-lg p-3 bg-[#3E1F0A] hover:bg-amber-900 text-white"
                  onClick={() => {}}
                  disabled
                >
                  <PlayIcon /> Play Now
                </Button>
              ) : (
                <Button
                  size={"lg"}
                  variant={"secondary"}
                  className="flex gap-3 h-14 rounded-full px-8 text-lg p-3 bg-[#3E1F0A] hover:bg-amber-900 text-white"
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
                className="flex gap-3 text-lg h-14 rounded-full bg-[#3E1F0A] text-white hover:bg-amber-900 px-8 p-3 "
                onClick={() => {
                  gameStore.endGame();
                  gameStore.reset();
                  router.push("/play");
                }}
              >
                <PlayIcon /> Play Now
              </Button>
            )}
          </div>
          {!leaderboardLoading && leaderboard != null ? (
            <Leaderboard
              players={leaderboard.data.map((player, index) => ({
                avatar: player.image,
                name: player.name,
                time: player.time,
                position: index + 1,
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
