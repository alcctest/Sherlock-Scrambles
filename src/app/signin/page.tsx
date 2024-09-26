"use client";

import { auth } from "@/auth";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { redirect } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { FaCircleQuestion } from "react-icons/fa6";
import { CiCircleQuestion } from "react-icons/ci";
import { useStore } from "@/stores/clientStore";

export default function SigninPage() {
  let { data: session } = useSession();

  if (session) {
    redirect("/");
  }
  let toggleHelpMenu = useStore((state) => state.toggleHelpMenu);
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div
        className="h-full w-full "
        style={{
          backgroundImage: 'url("/background-image.png")',
          backgroundSize: "cover", // Cover the entire div
          backgroundPosition: "center",
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div className="bg-white rounded-lg p-6 shadow-md w-80 gap-5 flex justify-center flex-col">
            <h2 className="text-xl font-bold text-center">Sherlock Scramble</h2>
            <p className="text-lg text-center">Let's get started!</p>
            <Button size={"lg"} variant={"outline"} className="border-2 flex gap-3 text-lg p-3" onClick={() => {
                signIn("google");
            }}>
                <FcGoogle size={32}/>Login with Google
            </Button>
            <Button size={"lg"} variant={"outline"} className="border-2 flex gap-3 text-lg p-3" onClick={toggleHelpMenu}>
                <CiCircleQuestion size={32}/>How to Play?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
