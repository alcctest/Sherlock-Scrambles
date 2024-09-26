import { auth } from "@/auth"
import { getLeaderboard } from "@/lib/firestore"
import { NextResponse } from "next/server"
 
export const GET = async () => {
    return NextResponse.json({
        data: await getLeaderboard()
    });
}

export const POST = auth(async function POST(req) {
    
})