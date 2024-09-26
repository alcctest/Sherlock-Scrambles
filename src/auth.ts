import { FirestoreAdapter } from "@auth/firebase-adapter"
import NextAuth from "next-auth"
import { db } from "./lib/firestore"
import authConfig from "./auth.config"

 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: FirestoreAdapter(db),
  callbacks: {
    async signIn({  account, profile }) {
      if (profile != null && account != null && account.provider === "google" && profile.email_verified === true && profile.email != null && profile.email.endsWith("@sxc.edu.np")) {
        return true
      }
      return false
    } 
  },
  session: {
    strategy: "jwt",
  },
  ...authConfig
})
