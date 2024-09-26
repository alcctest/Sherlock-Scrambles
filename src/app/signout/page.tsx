"use client";

import { NavBar } from "@/components/NavBar";
import { LoaderIcon, LucideLoader2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignoutPage() {
  let { data: session, status } = useSession();
  if (status === "loading") {
    return (
      <div className="flex h-screen justify-center items-center">
        <LucideLoader2 className="animate-spin" />
      </div>
    );
  }
  if (status === "unauthenticated") {
    useRouter().push("/signin");
    return (
      <div className="flex h-screen justify-center items-center">
        <LucideLoader2 className="animate-spin" />
      </div>
    );
  }
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
        <div className="flex justify-center items-center h-full">
          <div className="bg-white rounded-lg p-5 w-96 gap-3 flex justify-center flex-col">
            <h1 className="mb-2 flex flex-row items-center justify-center gap-2 text-2xl font-bold tracking-tight text-red-700">
              Leaving so Soon?
            </h1>
            <div className="text-lg text-center">
              <p>Are you sure you want to logout from your account?</p>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => {
                  signOut({
                    redirectTo: "/",
                  });
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
