"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ShieldAlert,
  MapPin,
  ChevronDown,
  Menu,
  User,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";
import { LibraryCard, LibraryListItem } from "../../components/LibraryCard";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import AlcoveLogo from "../../components/AlcoveLogo";
import { useAuth } from "../../context/AppContext";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatarErr, setAvatarErr] = useState(false);

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
    return `${apiBase}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search state initialized from query params
  const [cityQuery, setCityQuery] = useState(searchParams.get("city") || "");
  const [startDateQuery, setStartDateQuery] = useState(searchParams.get("start") || "");
  const [endDateQuery, setEndDateQuery] = useState(searchParams.get("end") || "");
  const [selectedLat, setSelectedLat] = useState<number | null>(searchParams.get("lat") ? Number(searchParams.get("lat")) : null);
  const [selectedLng, setSelectedLng] = useState<number | null>(searchParams.get("lng") ? Number(searchParams.get("lng")) : null);
  
  // activeSearch is what actually drives the API call
  const [activeSearch, setActiveSearch] = useState(searchParams.get("city") || "");
  const [activeLat, setActiveLat] = useState<number | null>(searchParams.get("lat") ? Number(searchParams.get("lat")) : null);
  const [activeLng, setActiveLng] = useState<number | null>(searchParams.get("lng") ? Number(searchParams.get("lng")) : null);

  // Update when URL changes
  useEffect(() => {
    setCityQuery(searchParams.get("city") || "");
    setActiveSearch(searchParams.get("city") || "");
    setStartDateQuery(searchParams.get("start") || "");
    setEndDateQuery(searchParams.get("end") || "");
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
    setSelectedLat(lat);
    setActiveLat(lat);
    setSelectedLng(lng);
    setActiveLng(lng);
  }, [searchParams]);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetch libraries
  const { data: libraries, isLoading, error } = useQuery<LibraryListItem[]>({
    queryKey: ["libraries", activeSearch, activeLat, activeLng],
    queryFn: async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      
      let url = `${apiBase}/libraries/search?query=${encodeURIComponent(activeSearch)}`;
      if (activeLat !== null && activeLng !== null) {
        url += `&lat=${activeLat}&lng=${activeLng}&radius=5`;
      } else if (!activeSearch) {
        url = `${apiBase}/libraries`;
      }
      
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

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(cityQuery);
    setActiveLat(selectedLat);
    setActiveLng(selectedLng);
    
    // Update URL to reflect new search
    const params = new URLSearchParams();
    if (cityQuery) params.set("city", cityQuery);
    if (selectedLat !== null) params.set("lat", selectedLat.toString());
    if (selectedLng !== null) params.set("lng", selectedLng.toString());
    if (startDateQuery) params.set("start", startDateQuery);
    if (endDateQuery) params.set("end", endDateQuery);
    
    router.push(`/search?${params.toString()}`);
  };

  // Filter logic
  const filteredLibraries = libraries?.filter((lib) => {
    const cheapestPrice = lib.slotTypes.length
      ? Math.min(...lib.slotTypes.map((s) => Number(s.price)))
      : 0;
    if (cheapestPrice > maxPrice) return false;

    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every((amenity) => lib.amenities.includes(amenity));
      if (!hasAll) return false;
    }

    return true;
  });

  return (
    <div className="w-full bg-white min-h-screen text-[#221C19] flex flex-col">
      {/* Sleek Airbnb-style Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1 hidden md:block">
            <Link href="/">
              <AlcoveLogo variant="dark" size="sm" />
            </Link>
          </div>
          
          {/* Center: Pill Search */}
          <div className="flex-1 flex justify-center w-full md:w-auto px-4 md:px-0">
            <div className="flex items-center bg-white border border-stone-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 divide-x divide-stone-200 py-1.5 pl-2 pr-1.5 w-full max-w-2xl">
              
              <div className="px-5 py-1 flex-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-800 block mb-0.5">
                  Location
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
                    value={startDateQuery} 
                    onChange={(e)=>setStartDateQuery(e.target.value)} 
                    className="w-full text-sm font-semibold text-stone-900 bg-transparent outline-none cursor-pointer" 
                  />
                  <span className="text-stone-300">-</span>
                  <input 
                    type="date" 
                    value={endDateQuery} 
                    min={startDateQuery} 
                    onChange={(e)=>setEndDateQuery(e.target.value)} 
                    className="w-full text-sm font-semibold text-stone-900 bg-transparent outline-none cursor-pointer" 
                  />
                </div>
              </div>

              <div className="pl-3">
                <button onClick={handleExecuteSearch} className="bg-[#A95031] text-white p-3.5 rounded-full hover:bg-[#8E3F24] transition flex items-center justify-center shrink-0 shadow-sm">
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
            </div>
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
                      className="w-9 h-9 rounded-full object-cover bg-stone-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#A95031] text-white flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 text-sm text-stone-900 z-50">
                    <div className="px-5 py-2 mb-2">
                      <p className="font-bold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-stone-100 w-full mb-2"></div>

                    <Link href="/profile" className="px-5 py-2.5 hover:bg-stone-50 flex items-center gap-3 transition font-medium">
                      <User className="w-4 h-4 text-stone-500" />
                      Profile
                    </Link>
                    <Link href="/messages" className="px-5 py-2.5 hover:bg-stone-50 flex items-center gap-3 transition font-medium">
                      <MessageSquare className="w-4 h-4 text-stone-500" />
                      Messages
                    </Link>
                    
                    {user?.role === "ADMIN" && (
                      <Link href="/admin/dashboard" className="px-5 py-2.5 hover:bg-stone-50 flex items-center gap-3 transition font-medium">
                        <Settings className="w-4 h-4 text-stone-500" />
                        Admin Panel
                      </Link>
                    )}
                    
                    {user?.role === "OWNER" || user?.role === "ADMIN" ? (
                      <Link href="/owner/libraries/create" className="px-5 py-2.5 hover:bg-stone-50 flex items-center gap-3 transition font-medium">
                        <LayoutDashboard className="w-4 h-4 text-stone-500" />
                        Host Dashboard
                      </Link>
                    ) : null}
                    
                    <div className="h-px bg-stone-100 w-full my-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-stone-50 flex items-center gap-3 transition font-medium text-red-600"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="px-4 sm:px-8 py-4 flex items-center flex-wrap gap-3 border-t border-stone-200">
          
          <div className="relative group z-50">
            <button className="flex items-center gap-2 border border-stone-300 rounded-full px-5 py-2 text-sm font-semibold hover:border-stone-900 transition bg-white text-stone-700">
              Price <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 hidden group-hover:block z-50">
              <h4 className="text-sm font-bold text-stone-800 mb-4">Maximum Price: ₹{maxPrice}</h4>
              <input
                type="range"
                min="50"
                max="600"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#A95031] h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-stone-400 font-medium mt-2">
                <span>₹50</span>
                <span>₹600+</span>
              </div>
            </div>
          </div>
          
          {/* Amenities Chips */}
          <div className="w-px h-6 bg-stone-200 mx-1 hidden sm:block"></div>
          {allAmenities.map(amenity => (
            <button
              key={amenity}
              onClick={() => handleAmenityToggle(amenity)}
              className={`flex items-center gap-2 border rounded-full px-5 py-2 text-sm font-semibold transition whitespace-nowrap ${
                selectedAmenities.includes(amenity)
                  ? "border-stone-900 bg-stone-100 text-stone-900"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </header>

      {/* Main Layout: Full Width Grid (Map Removed due to Billing) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 bg-white">
        
        <p className="text-sm font-medium text-stone-900 mb-6">
          {isLoading 
            ? "Searching for spaces..." 
            : filteredLibraries 
              ? `Over ${filteredLibraries.length} study spaces available` 
              : "No spaces found"}
        </p>
        
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-[300px] w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="font-bold text-red-700">Failed to load study spaces.</p>
          </div>
        )}

        {!isLoading && !error && filteredLibraries && filteredLibraries.length === 0 && (
          <div className="text-center py-20 border border-dashed border-stone-200 rounded-3xl bg-white mt-4 max-w-2xl mx-auto">
            <MapPin className="w-12 h-12 text-[#A0938A] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#221C19] mb-1">No Study Spaces Found</h3>
            <p className="text-xs text-[#6B5E57] max-w-sm mx-auto mb-6">
              Try adjusting your filters or searching another area.
            </p>
          </div>
        )}
        
        {!isLoading && !error && filteredLibraries && filteredLibraries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {filteredLibraries.map(lib => (
              <LibraryCard key={lib.id} lib={lib} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
