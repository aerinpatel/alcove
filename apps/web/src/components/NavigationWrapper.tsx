"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";


export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOwnerRoute = pathname?.startsWith("/owner");
  const isAuthRoute = pathname?.startsWith("/auth");

  const showNavbarAndFooter = !isOwnerRoute && !isAuthRoute;

  return (
    <>
      {showNavbarAndFooter && <Navbar />}
      <main className="flex-grow">{children}</main>
      {showNavbarAndFooter && <Footer />}
    </>
  );
}
