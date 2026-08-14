"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "../context/AppContext";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Search state
  const [cityQuery, setCityQuery] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");

  useEffect(() => {
    if (user?.role === "OWNER") {
      router.push("/owner/libraries/create");
    }
  }, [user, router]);

  if (user?.role === "OWNER") {
    return null; // Don't render the user-side home page for owners
  }

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Navigate to the new search page with query params
    const params = new URLSearchParams();
    if (cityQuery) params.set("city", cityQuery);
    if (selectedLat !== null) params.set("lat", selectedLat.toString());
    if (selectedLng !== null) params.set("lng", selectedLng.toString());
    if (startDateQuery) params.set("start", startDateQuery);
    if (endDateQuery) params.set("end", endDateQuery);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full bg-[#111111] min-h-screen text-[#221C19]">
      {/* Full-Screen Architectural Hero Section */}
      <div className="relative w-full min-h-screen flex flex-col justify-between select-none overflow-hidden px-4 sm:px-10 py-6 text-white">
        
        {/* Hero Background Image with Atmospheric Dark Overlay */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <img
            src="https://studyspace-photos.s3.ap-south-1.amazonaws.com/useful/landing+page.jpg"
            alt="Alcove Study Space"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60 z-0" />
        </div>

        {/* Oversized Background Typography ("ALCOVE") */}
        <h1 className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 text-[14vw] font-black font-serif tracking-tighter text-white/30 select-none uppercase pointer-events-none z-0 whitespace-nowrap leading-none text-center drop-shadow-xl">
          ALCOVE
        </h1>

        {/* Hero Bottom Content - Tagline on Left, Transparent Search on Right */}
        <div className="relative z-10 mt-auto pt-24 sm:pt-36 pb-4 flex flex-col lg:flex-row items-end justify-between gap-8">
          
          {/* Left Column: Guaranteed 3-Line Tagline */}
          <div className="max-w-xl text-left mb-8 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold font-serif text-white tracking-tight leading-[1.1] drop-shadow-lg">
              <span className="block whitespace-nowrap">Find Your Place</span>
              <span className="block whitespace-nowrap">to Learn and</span>
              <span className="block whitespace-nowrap">Grow</span>
            </h1>
          </div>

          {/* Right Column: Transparent Smooth Sleek Search Feature */}
          <div className="w-full lg:w-auto shrink-0 mb-8 lg:mb-12">
            <div className="bg-black/45 backdrop-blur-2xl border border-white/20 p-3 sm:p-4 rounded-3xl sm:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/15 text-white">
              
              {/* Location Input */}
              <div className="flex-1 px-5 py-2 w-full">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#A95031] block mb-1">
                  LOCATION
                </label>
                <LocationAutocomplete
                  value={cityQuery}
                  onChange={setCityQuery}
                  onPlaceSelect={(lat, lng, address) => {
                    setSelectedLat(lat);
                    setSelectedLng(lng);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExecuteSearch(e);
                  }}
                  placeholder="Where do you want to study?"
                  className="w-full text-xs sm:text-base font-semibold text-white bg-transparent outline-none placeholder:text-white/50"
                />
              </div>

              {/* Booking Dates */}
              <div className="flex-1 px-5 py-2 w-full">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#A95031] block mb-1">
                  BOOKING DATES
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDateQuery}
                    onChange={(e) => setStartDateQuery(e.target.value)}
                    className="w-full text-xs sm:text-base font-semibold text-white bg-transparent outline-none cursor-pointer [color-scheme:dark]"
                  />
                  <span className="text-[#A95031] font-bold text-xs">-</span>
                  <input
                    type="date"
                    value={endDateQuery}
                    min={startDateQuery}
                    onChange={(e) => setEndDateQuery(e.target.value)}
                    className="w-full text-xs sm:text-base font-semibold text-white bg-transparent outline-none cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Search Action Button */}
              <div className="p-1 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleExecuteSearch}
                  className="w-full md:w-auto bg-[#A95031] hover:bg-[#c25c38] text-white text-sm sm:text-base font-bold px-10 py-4 rounded-full transition duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95"
                >
                  <Search className="w-5 h-5 text-white" />
                  <span>Search</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
