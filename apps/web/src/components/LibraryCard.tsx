import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export interface LibraryListItem {
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
  latitude?: number;
  longitude?: number;
}

export function LibraryCard({ lib }: { lib: LibraryListItem }) {
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
