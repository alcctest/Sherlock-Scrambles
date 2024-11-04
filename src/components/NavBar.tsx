"use client";

import { Logo } from "@/assets/Logo";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { CircleHelp, LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import React from "react";
import { twMerge } from "tailwind-merge";
import CustomModal from "./CustomModal";
import { useStore } from "@/stores/clientStore";
import CreditsModal from "./CreditsModal";

interface NavBarProps {
  // Define any props you want to pass to the NavBar component
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = (props) => {
  const { data: session } = useSession();
  const toggleHelp = useStore((state) => state.toggleHelpMenu);
  const toggleCredits = useStore((state) => state.toggleCreditMenu);
  return (
    <div>
      <CustomModal
        header={"HOW TO PLAY?"}
        steps={[
          "Register: Sign up with your college email to participate.",
          "Solve: You'll have three attempts to complete the word search to get your fastest time.",
          "Compete: Your score will be ranked against other participants.",
        ]}
      />
      <CreditsModal />
      <nav className={twMerge("bg-white shadow-sm m-1", props.className)}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link href={"/"}>
            <div className="w-40">
              <Logo className="w-full h-auto" />
            </div>
          </Link>
          <div className="flex flex-col items-end space gap-1">
            <Link href={"https://pitchdeck.hypermatic.com/slides/m1jeocsz99417/?token=I3BYb1BzeHpiNzBAN2c%3D&slide=0"}>
              <Button variant="default" className="rounded-full bg-[#2A170E]">
                View Panorama
              </Button>
            </Link>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-24 cursor-pointer" onClick={toggleCredits}>
                <Image
                  src="/placeholder.png"
                  alt="Secondary Logo"
                  width={96}
                  height={24}
                  className="w-full h-auto"
                />
              </div>
              <CircleHelp className="w-6 h-6 text-black cursor-pointer" onClick={toggleHelp} />
              {session && (
                <Link href={"/signout"}>
                  <LogOutIcon className="w-6 h-6 text-black" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
