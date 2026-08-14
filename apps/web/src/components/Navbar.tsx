"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useSocket } from "../context/AppContext";
import { Search, Menu, User, LogOut, Compass, LayoutDashboard, Settings, MapPin, MessageSquare } from "lucide-react";

import AlcoveLogo from "./AlcoveLogo";
import OwnerNavbar from "./OwnerNavbar";
import { getAvatarUrl } from "../utils/avatar";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const pathname = usePathname();



  const isHome = pathname === "/";
  const isSearchOrLibrary = pathname?.startsWith("/search") || pathname?.startsWith("/libraries");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarErr, setAvatarErr] = useState(false);

  // Search overlay inputs
  const [cityVal, setCityVal] = useState("");
  const [startDateVal, setStartDateVal] = useState("");
  const [endDateVal, setEndDateVal] = useState("");
  const [guestsVal, setGuestsVal] = useState(1);

  // Suggestions state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { name: "Gurugram", desc: "Popular hubs in Haryana" },
    { name: "Mumbai", desc: "Commercial study libraries" },
    { name: "North Goa", desc: "Quiet coastal reading rooms" },
    { name: "Delhi", desc: "Central capital study zones" },
  ];

  // Scroll detection to collapse/expand search pill
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (suggestRef.current && !suggestRef.current.contains(event.target as Node)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications for owner & setup socket listener
  useEffect(() => {
    if (!user || user.role !== "OWNER" || !token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${apiBase}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread notification count:", err);
      }
    };

    fetchNotifications();

    if (socket) {
      socket.emit("join-user", user.id);
      const handleNewNotification = () => {
        setUnreadCount((prev) => prev + 1);
      };
      socket.on("new-notification", handleNewNotification);
      return () => {
        socket.off("new-notification", handleNewNotification);
      };
    }
  }, [user, token, socket]);

  const handleOverlaySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchExpanded(false);

    const params = new URLSearchParams();
    if (cityVal) params.set("city", cityVal);
    if (startDateVal) params.set("startDate", startDateVal);
    if (endDateVal) params.set("endDate", endDateVal);
    if (guestsVal) params.set("guests", String(guestsVal));

    router.push(`/?${params.toString()}`);
  };

  if (user?.role === "OWNER" || pathname?.startsWith("/owner")) {
    return <OwnerNavbar />;
  }

  if (isHome) {
    return (
      <header
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all duration-300"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-stone-200 p-2 pl-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" onClick={() => setIsSearchExpanded(false)} className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform overflow-hidden p-1">
              <AlcoveLogo size="sm" iconOnly variant="light" />
            </div>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`relative group text-sm font-semibold transition-colors py-2 text-stone-900`}
            >
              Home
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 scale-x-100`}></span>
            </Link>
            <Link
              href="/bookings"
              className={`relative group text-sm font-semibold transition-colors py-2 text-stone-500 hover:text-stone-900`}
            >
              My Bookings
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 scale-x-0 group-hover:scale-x-100`}></span>
            </Link>
            <Link
              href="/about"
              className={`relative group text-sm font-semibold transition-colors py-2 text-stone-500 hover:text-stone-900`}
            >
              About Us
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 scale-x-0 group-hover:scale-x-100`}></span>
            </Link>
            <Link
              href="/contact"
              className={`relative group text-sm font-semibold transition-colors py-2 text-stone-500 hover:text-stone-900`}
            >
              Contact Us
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 scale-x-0 group-hover:scale-x-100`}></span>
            </Link>
          </nav>

        {/* User Actions - Right Corner */}
        <div className="flex items-center gap-4 shrink-0 pr-1">
          {!user ? (
            <Link
              href="/auth/signup"
              className="text-sm font-bold px-6 py-2.5 rounded-full transition shadow-md flex items-center justify-center cursor-pointer bg-stone-900 hover:bg-stone-800 text-white"
            >
              Get Started
            </Link>
          ) : (
            /* User Menu Dropdown when logged in */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center rounded-full cursor-pointer relative shadow-sm border border-stone-200 hover:ring-2 hover:ring-stone-300 transition-all w-11 h-11 bg-white"
              >
                {user?.avatarUrl && !avatarErr ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl) || user.avatarUrl}
                    alt={user.name}
                    onError={() => setAvatarErr(true)}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-xl shadow-xl border border-[#E8E2D5] py-2 text-sm text-[#221C19] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#E8E2D5]">
                    <p className="font-semibold text-[#221C19] truncate">{user.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-[#6B5E57] truncate">{user.email}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-light text-brand-dark px-1.5 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* 1st Option: Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]"
                  >
                    <User className="w-4 h-4 text-[#6B5E57]" />
                    Profile
                  </Link>

                  {/* 2nd Option: Messages */}
                  <Link
                    href="/messages"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]"
                  >
                    <MessageSquare className="w-4 h-4 text-[#6B5E57]" />
                    Messages
                  </Link>

                  {/* Host Home (for Admin or Host) */}
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/owner/libraries/create"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#6B5E57]" />
                      Host Home
                    </Link>
                  )}

                  {/* Admin Panel (if applicable) */}
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]"
                    >
                      <Settings className="w-4 h-4 text-[#6B5E57]" />
                      Admin Panel
                    </Link>
                  )}

                  {/* 3rd Option: Log Out */}
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      router.push("/auth/signup");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 transition text-red-600 border-t border-[#E8E2D5] mt-1 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
    );
  }

  // Standard sticky navbar for other pages
  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="px-4 sm:px-8 py-4 flex items-center justify-between mx-auto max-w-7xl">
        {/* Left: Logo */}
        <div className="flex-1 hidden md:block">
          <Link href="/">
            <AlcoveLogo variant="dark" size="sm" />
          </Link>
        </div>
        
        {/* Center: Navigation Links or Search Pill */}
        <div className="flex-1 flex justify-center w-full md:w-auto px-4 md:px-0">
          {isSearchOrLibrary ? (
            <div className="flex items-center bg-white border border-stone-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 divide-x divide-stone-200 py-1.5 pl-2 pr-1.5 w-full max-w-2xl">
              
              <div className="px-5 py-1 flex-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-800 block mb-0.5">
                  Location
                </label>
                <input 
                  type="text"
                  value={cityVal} 
                  onChange={(e) => setCityVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleOverlaySearchSubmit(e as any);
                  }}
                  className="w-full text-sm font-semibold text-stone-900 placeholder:text-stone-400 bg-transparent outline-none truncate"
                  placeholder="Where to?"
                />
              </div>

              <div className="px-5 py-1 flex-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-800 block mb-0.5">
                  Dates
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={startDateVal} 
                    onChange={(e) => setStartDateVal(e.target.value)} 
                    className="w-full text-sm font-semibold text-stone-900 bg-transparent outline-none cursor-pointer" 
                  />
                  <span className="text-stone-300">-</span>
                  <input 
                    type="date" 
                    value={endDateVal} 
                    min={startDateVal} 
                    onChange={(e) => setEndDateVal(e.target.value)} 
                    className="w-full text-sm font-semibold text-stone-900 bg-transparent outline-none cursor-pointer" 
                  />
                </div>
              </div>

              <div className="pl-3">
                <button onClick={handleOverlaySearchSubmit} className="bg-[#A95031] text-white p-3.5 rounded-full hover:bg-[#8E3F24] transition flex items-center justify-center shrink-0 shadow-sm">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className={`relative group text-sm font-semibold transition-colors py-2 text-stone-500 hover:text-stone-900`}
              >
                Home
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 scale-x-0 group-hover:scale-x-100`}></span>
              </Link>
              <Link
                href="/bookings"
                className={`relative group text-sm font-semibold transition-colors py-2 ${pathname?.startsWith("/bookings") ? "text-stone-900" : "text-stone-500 hover:text-stone-900"}`}
              >
                My Bookings
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 ${pathname?.startsWith("/bookings") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </Link>
              <Link
                href="/about"
                className={`relative group text-sm font-semibold transition-colors py-2 ${pathname?.startsWith("/about") ? "text-stone-900" : "text-stone-500 hover:text-stone-900"}`}
              >
                About Us
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 ${pathname?.startsWith("/about") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </Link>
              <Link
                href="/contact"
                className={`relative group text-sm font-semibold transition-colors py-2 ${pathname?.startsWith("/contact") ? "text-stone-900" : "text-stone-500 hover:text-stone-900"}`}
              >
                Contact Us
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 transition-transform origin-left duration-300 ${pathname?.startsWith("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-2">
          {!user ? (
            <Link
              href="/auth/signup"
              className="font-semibold text-sm hover:bg-stone-50 px-4 py-2 rounded-full transition text-stone-900 border border-stone-200"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center rounded-full cursor-pointer relative hover:ring-2 hover:ring-stone-200 transition shadow-sm border border-stone-200"
              >
                {user?.avatarUrl && !avatarErr ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl) || user.avatarUrl}
                    alt={user.name}
                    onError={() => setAvatarErr(true)}
                    className="w-10 h-10 rounded-full object-cover bg-stone-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#A95031] text-white flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-xl shadow-xl border border-[#E8E2D5] py-2 text-sm text-[#221C19] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#E8E2D5]">
                    <p className="font-semibold text-[#221C19] truncate">{user.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-[#6B5E57] truncate">{user.email}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-light text-brand-dark px-1.5 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]">
                    <User className="w-4 h-4 text-[#6B5E57]" />
                    Profile
                  </Link>

                  <Link href="/messages" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]">
                    <MessageSquare className="w-4 h-4 text-[#6B5E57]" />
                    Messages
                  </Link>
                  
                  {user?.role === "ADMIN" && (
                    <Link href="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]">
                      <Settings className="w-4 h-4 text-[#6B5E57]" />
                      Admin Panel
                    </Link>
                  )}
                  
                  {user?.role === "ADMIN" ? (
                    <Link href="/owner/libraries/create" onClick={() => setDropdownOpen(false)} className="px-4 py-2.5 hover:bg-[#F7EBE4] hover:text-brand flex items-center gap-3 transition font-medium text-[#221C19]">
                      <LayoutDashboard className="w-4 h-4 text-[#6B5E57]" />
                      Host Dashboard
                    </Link>
                  ) : null}
                  
                  <div className="h-px bg-stone-100 w-full my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      router.push("/auth/signup");
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 transition font-medium text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </header>
      {isSearchExpanded && user && user.role === "STUDENT" && (
        <>
          {/* Backdrop overlay blur background */}
          <div
            onClick={() => setIsSearchExpanded(false)}
            className="fixed inset-0 z-30 bg-black/25 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Full Popout Menu container */}
          <div className="absolute top-0 left-0 w-full bg-[#F8F5EE] z-40 shadow-xl border-b border-[#E8E2D5] pb-8 pt-4 animate-in slide-in-from-top duration-250">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

              {/* Header row mirroring original logo + categories */}
              <div className="flex justify-between items-center h-20 mb-6">
                <Link href="/" onClick={() => setIsSearchExpanded(false)} className="flex items-center gap-2">
                  <span className="text-2xl font-black text-brand tracking-tight flex items-center gap-1">
                    <span className="bg-brand text-white p-1.5 rounded-lg flex items-center justify-center font-serif text-lg leading-none">S</span>
                    StudySpace
                  </span>
                </Link>

                {/* Subtitle workspace categories */}
                <div className="flex items-center text-sm font-semibold text-[#221C19]">
                  <span className="border-b-2 border-brand pb-1 cursor-pointer text-brand">Study Rooms</span>
                </div>

                {/* Placeholder to balance logo */}
                <div className="w-24" />
              </div>

              {/* 3-Column Airbnb Search Form */}
              <div className="max-w-3xl mx-auto relative">
                <form
                  onSubmit={handleOverlaySearchSubmit}
                  className="bg-white rounded-full border border-[#E8E2D5] p-2 pl-4 flex items-center shadow-lg relative"
                >
                  {/* Where */}
                  <div
                    ref={suggestRef}
                    className="flex-grow flex-1 flex flex-col items-start px-5 cursor-pointer relative"
                    onClick={() => setSuggestOpen(true)}
                  >
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B5E57] mb-0.5">Where</label>
                    <input
                      type="text"
                      value={cityVal}
                      onChange={(e) => {
                        setCityVal(e.target.value);
                        setSuggestOpen(true);
                      }}
                      placeholder="Search destinations"
                      className="w-full text-xs text-[#221C19] bg-transparent outline-none placeholder-gray-400 font-bold"
                    />

                    {/* Suggestions list popup */}
                    {suggestOpen && (
                      <div className="absolute top-14 left-0 w-80 bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                        <p className="text-[9px] font-black uppercase text-[#6B5E57] tracking-wider mb-3">Suggested destinations</p>
                        <div className="space-y-1">
                          {suggestions.map((s) => (
                            <button
                              key={s.name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCityVal(s.name);
                                setSuggestOpen(false);
                              }}
                              className="w-full text-left hover:bg-[#F7EBE4] p-2.5 rounded-xl flex items-center gap-3 transition cursor-pointer"
                            >
                              <div className="bg-[#F7EBE4] p-2 rounded-lg text-brand shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#221C19]">{s.name}</p>
                                <p className="text-[10px] text-[#6B5E57]">{s.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* When (From Date) */}
                  <div className="flex-1 flex flex-col items-start px-6 border-l border-[#E8E2D5] cursor-pointer">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B5E57] mb-0.5">From Date</label>
                    <input
                      type="date"
                      value={startDateVal}
                      onChange={(e) => setStartDateVal(e.target.value)}
                      className="w-full text-xs text-[#221C19] bg-transparent outline-none cursor-pointer font-bold"
                    />
                  </div>

                  {/* When (To Date) */}
                  <div className="flex-1 flex flex-col items-start px-6 border-l border-r border-[#E8E2D5] cursor-pointer">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B5E57] mb-0.5">To Date</label>
                    <input
                      type="date"
                      value={endDateVal}
                      min={startDateVal}
                      onChange={(e) => setEndDateVal(e.target.value)}
                      className="w-full text-xs text-[#221C19] bg-transparent outline-none cursor-pointer font-bold"
                    />
                  </div>

                  {/* Who */}
                  <div className="flex-1 flex flex-col items-start px-6">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B5E57] mb-0.5">Who</label>
                    <input
                      type="number"
                      min="1"
                      value={guestsVal}
                      onChange={(e) => setGuestsVal(Number(e.target.value))}
                      placeholder="Add guests"
                      className="w-full text-xs text-[#221C19] bg-transparent outline-none font-bold"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer shadow-md font-bold text-xs shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </form>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
