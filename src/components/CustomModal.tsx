"use client";

import { useState } from "react";
import { X, HelpCircle, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/clientStore";
import React from "react";

interface CustomModalProps {
  header: string;
  steps: string[];
}

export default function CustomModal(
  {
    header,
    steps,
  }: CustomModalProps = {
    header: "Modal Header",
    steps: ["Modal Description"],
  }
) {
  let isOpen = useStore((state) => {
    return state.isHelpOpen;
  });
  let setIsOpen = useStore((state) => state.setIsHelpOpen);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={
        setIsOpen
      }>
        <DialogContent className="bg-[#e7e8f0] sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-full p-1">
                <HelpCircle className="h-6 w-6" />
              </div>
              <DialogTitle>{header}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
          <ul className="flex flex-col gap-2">
            {steps.map((step, index) => (
              <li key={index} className="text-black text-lg">
                <span className="font-bold text-xl">{index + 1}. </span>
                {step}
              </li>
            ))}
          </ul>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
