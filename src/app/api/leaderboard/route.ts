import { auth } from "@/auth";
import { db, getLeaderboard, saveAttempt } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    data: await getLeaderboard(),
  });
};

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth?.user?.email) {
    return NextResponse.json(
      { message: "Not authenticated" },
      {
        status: 401,
      }
    );
  }

  const data = (await req.json()) as {
    data: {
      time: number;
      foundWords: string[];
    }
  };
  console.log(data);
  if (!data || !data.data || !data.data.foundWords || !data.data.time) {
    return NextResponse.json({
      status: 406,
      message: "Invalid data provided.",
    });
  }
  let position = await saveAttempt(req.auth.user.email, data.data.time, data.data.foundWords);

  return NextResponse.json({
    status: 200,
    message: "Submitted the attempt.",
    data: {
      position,
    },
  });
});
