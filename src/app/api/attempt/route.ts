import { auth } from "@/auth";
import { createAttempt, getRemainingAttempts } from "@/lib/firestore";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
  if (!req.auth || !req.auth?.user?.email) {
    return NextResponse.json({ message: "Not authenticated" }, {
      status: 401,
    });
  }
  return NextResponse.json({
    data: {
      attempts: await getRemainingAttempts(req.auth.user.email),
    }
  });
}); 

export const POST = auth(async function POST(req) {
  if (!req.auth || !req.auth?.user?.email) {
    return NextResponse.json({ message: "Not authenticated" }, {
      status: 401,
    });
  }

  // decrement the attempts and generate word pool and grid.
  let attempt = await createAttempt(req.auth.user.email);
  return NextResponse.json({ data: attempt });
  //                          ^? 
})