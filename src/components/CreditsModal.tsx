"use client";

import { useState } from "react";
import { X, HelpCircle, Store, Users2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/stores/clientStore";
import React from "react";
export default function CreditsModal() {
  let isOpen = useStore((state) => {
    return state.isCreditOpen;
  });
  let setIsOpen = useStore((state) => state.setToggleCreditMenu);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#e7e8f0] sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full p-1">
                <Users2Icon className="h-6 w-6" />
              </div>
              <DialogTitle>Meet the Team</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            {/* {details.map((detail, index) => (
              <li key={index} className="text-black text-lg">
                {/* <span className="font-bold text-xl">{index + 1}. </span>
                detail
              </li>
            )) 
             
             details={[
          "Meet the team behind the creation of the Sherlock's Search.",
          "",
          "Developed by:",
          "Sushant Pangeni (Project Lead)",
        ]}*/}
            <p className="text-lg text-black">
              Meet the team behind the creation of Sherlock's Scramble.
            </p>

            <p className="text-base font-bold mt-2 text-black">Developed by:</p>
            <div className="flex flex-col gap-2 text-black text-base">
              <ul className="list-decimal m-auto">
                <li>Sushant Pangeni (Project Lead)</li>
                <li>Shrijan Poudel</li>
                <li>Aarogya Nepal</li>
                <li>Baman Prasad Guragain</li>
                <li>Parchetash Dhakal</li>
                <li>Pratyush Raj Jha</li>
                <li>Prerit Gautam</li>
                <li>Rhishav Lamichhane</li>
                <li>Samip Panthi</li>
                <li>Shriyans Shrestha</li>
                <li>Stuti Upreti</li>
                <li>Creation Duwal</li>
              </ul>
              <p>Special thanks to the VISTAS Team for presenting a platform inviting creative collaboration.</p>
              <p>The code of the game is publicly available via the <a target="_blank" href="https://github.com/SXC-ALCC/Sherlock-Scrambles-Ts" className="text-blue-900">GitHub Repository</a> to allow for further collaboration and feature requests.</p>
              <p>Email : <a href="mailto:alcc@sxc.edu.np">ALCC</a></p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
