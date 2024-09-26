import NextAuth from "next-auth"
import authConfig from "@/auth.config"
 
export const { auth: middleware, signIn, signOut } = NextAuth(authConfig)
