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
    <footer className="bg-[#111111] text-white/90 border-t border-white/10 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-white/10">
          <Link href="/" className="inline-block">
            <AlcoveLogo variant="light" size="md" />
          </Link>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 bg-[#A95031] hover:bg-[#8E3F24] text-white font-bold text-xs px-5 py-2.5 rounded-full transition shadow-lg cursor-pointer shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Visit Your Profile</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-6 text-sm">
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition text-white/60 font-semibold tracking-wide text-xs uppercase">About Us</Link>
            <Link href="#contact" className="hover:text-white transition text-white/60 font-semibold tracking-wide text-xs uppercase">Contact Us</Link>
          </div>
          
          <div className="text-white/60 text-xs font-medium">
            Made By{" "}
            <a href="https://github.com/aerinpatel" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#A95031] transition font-bold">
              Aerin Patel
            </a>{" "}
            <span className="text-red-500">❤️</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 font-bold px-4 py-2 rounded-full border border-white/10 transition cursor-pointer text-xs shrink-0"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3 text-[#A95031]" />
          </button>
        </div>

      </div>
    </footer>
  );
}
