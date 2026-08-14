"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  ShieldAlert,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Wifi,
  Wind,
  Armchair,
  VolumeX,
  Droplet,
} from "lucide-react";
import { useAuth } from "../context/AppContext";

interface LibraryListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  amenities: string[];
  photos: string[];
  slotTypes: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    price: string;
  }[];
  rating: number | null;
  reviewCount: number;
}

const getAmenityIcon = (name: string) => {
  switch (name) {
    case "High-speed Wi-Fi":
      return <Wifi className="w-4 h-4 text-stone-500 shrink-0" />;
    case "Air Conditioning":
      return <Wind className="w-4 h-4 text-stone-500 shrink-0" />;
    case "Ergonomic Chairs":
      return <Armchair className="w-4 h-4 text-stone-500 shrink-0" />;
    case "Quiet Zone":
      return <VolumeX className="w-4 h-4 text-stone-500 shrink-0" />;
    case "Drinking Water":
      return <Droplet className="w-4 h-4 text-stone-500 shrink-0" />;
    default:
      return <Wifi className="w-4 h-4 text-stone-500 shrink-0" />;
  }
};

function LibraryCard({ lib }: { lib: LibraryListItem }) {
  const photo = lib.photos && lib.photos.length > 0
    ? lib.photos[0]
    : "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80";
  const lowestPrice = lib.slotTypes && lib.slotTypes.length > 0
    ? Math.min(...lib.slotTypes.map((s) => Number(s.price)))
    : 150;
  const ratingVal = lib.rating ? lib.rating.toFixed(1) : "5.0";

  return (
    <Link
      href={"/libraries/" + lib.id}
      className="group flex flex-col bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      {/* Top Spacious Image Frame (Aspect 4/3) */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        <img
          src={photo}
          alt={lib.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-black/55 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs truncate max-w-[150px]">
            📍 {lib.city || "Gurugram"}
          </span>

          <span className="bg-white/95 backdrop-blur-md text-stone-900 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{ratingVal}</span>
          </span>
        </div>

        {/* Hover Reserve Pill Overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="w-full bg-[#A95031] text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-md">
            <span>Reserve Seat</span>
            <span className="text-sm">→</span>
          </span>
        </div>
      </div>

      {/* Spacious Card Info Section */}
      <div className="p-5 space-y-2">
        <h3 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-[#A95031] transition truncate">
          {lib.name}
        </h3>

        <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed min-h-[32px]">
          {lib.address || `${lib.city}, India`}
        </p>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-[#A95031] text-lg">₹{lowestPrice}</span>
            <span className="text-stone-400 font-medium text-xs">/ slot</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Search state
  const [cityQuery, setCityQuery] = useState("");
  const [startDateQuery, setStartDateQuery] = useState("");
  const [endDateQuery, setEndDateQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchStep, setSearchStep] = useState<1 | 2>(1);
  const [hasSearched, setHasSearched] = useState(true);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Popular shortcut cities
  const popularCities = ["Gurugram", "Mumbai", "Delhi"];

  // Fetch libraries using TanStack Query
  const { data: libraries, isLoading, error } = useQuery<LibraryListItem[]>({
    queryKey: ["libraries", activeSearch],
    queryFn: async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const url = activeSearch
        ? `${apiBase}/libraries/search?query=${encodeURIComponent(activeSearch)}`
        : `${apiBase}/libraries`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load libraries");
      return res.json();
    },
  });



  const allAmenities = [
    "High-speed Wi-Fi",
    "Air Conditioning",
    "Ergonomic Chairs",
    "Quiet Zone",
    "Drinking Water",
  ];

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleCityShortcutSelect = (city: string) => {
    setCityQuery(city);
    setSearchStep(2);
  };

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(cityQuery);
    setHasSearched(true);
    // Smooth scroll down to listings
    setTimeout(() => {
      const listingsEl = document.getElementById("search-results-section");
      if (listingsEl) {
        listingsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Filter listings client side based on pricing and amenities selection
  const filteredLibraries = libraries?.filter((lib) => {
    // 1. Price check (find cheapest slot)
    const cheapestPrice = lib.slotTypes.length
      ? Math.min(...lib.slotTypes.map((s) => Number(s.price)))
      : 0;
    if (cheapestPrice > maxPrice) return false;

    // 2. Amenities check
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((amenity) => lib.amenities.includes(amenity));
      if (!hasAll) return false;
    }

    return true;
  });

  return (
    <div className="w-full bg-[#F8F5EE] min-h-screen text-[#221C19]">
      
      {/* Full-Screen Architectural Hero Section */}
      <div className="relative w-full min-h-[90vh] sm:min-h-[820px] flex flex-col justify-between select-none overflow-hidden px-4 sm:px-10 py-6 text-white">
        
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
          <div className="max-w-xl text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight leading-[1.15] drop-shadow-lg">
              <span className="block whitespace-nowrap">Find Your Place</span>
              <span className="block whitespace-nowrap">to Learn and</span>
              <span className="block whitespace-nowrap">Grow</span>
            </h1>
          </div>

          {/* Right Column: Transparent Smooth Sleek Search Feature */}
          <div className="w-full lg:w-auto shrink-0">
            <div className="bg-black/45 backdrop-blur-2xl border border-white/20 p-3 sm:p-4 rounded-3xl sm:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/15 text-white">
              
              {/* Location Input */}
              <div className="flex-1 px-5 py-1.5 w-full">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#A95031] block mb-1">
                  LOCATION
                </label>
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExecuteSearch(e);
                  }}
                  placeholder="Where do you want to study?"
                  className="w-full text-xs sm:text-sm font-semibold text-white bg-transparent outline-none placeholder:text-white/50"
                />
              </div>

              {/* Booking Dates */}
              <div className="flex-1 px-5 py-1.5 w-full">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#A95031] block mb-1">
                  BOOKING DATES
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDateQuery}
                    onChange={(e) => setStartDateQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-white bg-transparent outline-none cursor-pointer [color-scheme:dark]"
                  />
                  <span className="text-[#A95031] font-bold text-xs">-</span>
                  <input
                    type="date"
                    value={endDateQuery}
                    min={startDateQuery}
                    onChange={(e) => setEndDateQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-white bg-transparent outline-none cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Search Action Button */}
              <div className="p-1 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleExecuteSearch}
                  className="w-full md:w-auto bg-[#A95031] hover:bg-[#c25c38] text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-full transition duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span>Search</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {hasSearched ? (
        <div id="search-results-section" className="bg-[#F8F5EE] text-[#221C19] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 border-t border-stone-200/60">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Toggle Filters Button for Mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-800 font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#A95031]" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Sidebar Filters - Sticky to top below navbar */}
        <aside
          className={`w-full lg:w-72 shrink-0 border border-stone-200/70 rounded-3xl p-6 bg-white shadow-sm sticky top-24 self-start z-20 max-h-[calc(100vh-7rem)] overflow-y-auto ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          <h3 className="text-base font-bold text-stone-900 mb-5 flex items-center gap-2 border-b border-stone-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-[#A95031]" />
            Filters
          </h3>

          {/* Pricing slider */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-stone-600 mb-2">Price per slot</h4>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-stone-400 font-medium">₹50</span>
              <span className="text-[#A95031] font-black text-sm">{"₹" + maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#A95031] h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Amenities filter with icons */}
          <div>
            <h4 className="text-xs font-semibold text-stone-600 mb-3">Amenities</h4>
            <div className="space-y-3">
              {allAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center justify-between text-xs text-stone-700 hover:text-stone-900 cursor-pointer transition group">
                  <div className="flex items-center gap-2.5">
                    {getAmenityIcon(amenity)}
                    <span className="font-medium group-hover:text-[#A95031] transition">{amenity}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 rounded border-stone-300 text-[#A95031] focus:ring-[#A95031] accent-[#A95031] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1 w-full">
          
          {/* Section Heading */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#221C19]">
                {activeSearch ? `Study Spaces in ${activeSearch}` : "Available Study Spaces"}
              </h2>
              <p className="text-xs text-[#6B5E57] mt-1">
                {filteredLibraries?.length || 0} reading rooms available for instant seat selection.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-stone-200/80 rounded-2xl h-80 w-full" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
              <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="font-bold text-red-700">Failed to load study spaces.</p>
              <p className="text-xs text-red-500 mt-1">Please verify database connectivity.</p>
            </div>
          )}

          {!isLoading && !error && filteredLibraries && filteredLibraries.length === 0 && (
            <div className="text-center py-20 border border-dashed border-stone-200/80 rounded-3xl bg-white">
              <MapPin className="w-12 h-12 text-[#A0938A] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#221C19] mb-1">No Study Spaces Found</h3>
              <p className="text-xs text-[#6B5E57] max-w-sm mx-auto mb-6">
                We couldn&apos;t find any reading rooms matching &quot;{activeSearch || "your criteria"}&quot;. Try adjusting your filters or searching another city.
              </p>
              <button
                onClick={() => {
                  setCityQuery("");
                  setActiveSearch("");
                  setSelectedAmenities([]);
                  setMaxPrice(600);
                  setSearchStep(1);
                }}
                className="bg-[#A95031] hover:bg-[#8E3F24] text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {!isLoading && !error && filteredLibraries && filteredLibraries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLibraries.map((lib) => (
                <LibraryCard key={lib.id} lib={lib} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  ) : null}
    </div>
  );
}
