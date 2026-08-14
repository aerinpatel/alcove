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
