import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { twMerge } from "tailwind-merge";

type LeaderboardProps = {
  players: {
    name: string;
    time: number;
    avatar: string;
    position: number;
  }[];
};

export default function Leaderboard({ players }: LeaderboardProps) {
  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const getBorderStyle = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400";
    if (index === 1)
      return "bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400";
    if (index === 2)
      return "bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600";
    return "";
  };

  const getTextStyle = (index: number) => {
    if (index === 1) return "text-yellow-900";
    if (index === 2) return "text-gray-900";
    if (index === 3) return "text-yellow-900";
    return "text-gray-800";
  }

  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Time Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[350px] flex">
          {players.map((player, index) => (
            <div
              key={index}
              className={`flex items-center m-2 space-x-4 p-3 rounded-lg ${getBorderStyle(
                index
              )}`}
            >
              <Avatar>
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback>{player.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="text-sm font-medium leading-none">
                  {player.name} {getMedalEmoji(index)}
                </p>
                <div className="flex w-full justify-between">
                  <p className="text-sm text-black">{formatTime(player.time)}</p>
                  <div className={twMerge("text-md font-bold  mr-2", getTextStyle(player.position))}>
                    <span className="text-">#</span>
                    <span>{player.position}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
