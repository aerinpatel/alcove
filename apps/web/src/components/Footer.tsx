"use client";

import React from "react";
import Link from "next/link";
import AlcoveLogo from "./AlcoveLogo";
import { ArrowUp, User } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#1C1715] text-[#E8E2D5] border-t border-[#332A26] select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-[#332A26]">
          <Link href="/" className="inline-block">
            <AlcoveLogo variant="light" size="md" />
          </Link>

          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs px-4 py-2 rounded-full transition shadow-md shadow-brand/20 cursor-pointer shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Visit Your Profile</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-6 text-sm">
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-brand transition text-[#A0938A] font-medium">About Us</Link>
            <Link href="#contact" className="hover:text-brand transition text-[#A0938A] font-medium">Contact Us</Link>
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 bg-[#2B2320] hover:bg-[#382E2A] text-white font-semibold px-4 py-2 rounded-md border border-[#332A26] transition cursor-pointer text-xs"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3 text-brand" />
          </button>
        </div>

      </div>
    </footer>
  );
}
