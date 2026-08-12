"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Calendar,
  RotateCcw,
  Eye,
  Key,
  MessageSquare,
  Clock,
  X,
  CheckCircle2,
  MapPin,
  Building2,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  DoorOpen,
  DoorClosed,
  ShieldCheck,
  FileText,
  Printer,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AppContext";

interface BookingItem {
  id: string;
  libraryId: string;
  date: string;
  status: string;
  totalPrice: string;
  accessKey: string;
  seat: {
    id: string;
    seatCode: string;
    seatType: string;
  };
  slotType: {
    name: string;
    startTime: string;
    endTime: string;
  };
  library: {
    id: string;
    name: string;
    address: string;
    photos: { url: string }[];
    owner?: {
      id?: string;
      name: string;
    };
  };
  review: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export default function BookingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();

  // Dynamic logged-in user initial
  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  // Tab State: "upcoming" or "past"
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Interactive Selected Booking State (Null = List view, BookingItem = Detail view)
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Copy Key state
  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch bookings using TanStack Query
  const { data: bookings, isLoading, error } = useQuery<BookingItem[]>({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiBase}/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
    enabled: !!token,
  });

  // Post review mutation
  const reviewMutation = useMutation({
    mutationFn: async (payload: { libraryId: string; rating: number; comment: string }) => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${apiBase}/libraries/${payload.libraryId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: payload.rating, comment: payload.comment || null }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setReviewModalOpen(false);
      setComment("");
      setRating(5);
    },
    onError: (err: any) => {
      setReviewError(err.message);
    },
  });

  const openReviewModal = (libraryId: string) => {
    setSelectedLibraryId(libraryId);
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({ libraryId: selectedLibraryId, rating, comment });
  };

  const handleCopyAccessKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center px-4 py-20 select-none">
        <div className="max-w-md w-full bg-white border border-stone-200/80 rounded-3xl p-8 text-center shadow-lg">
          <Clock className="w-12 h-12 text-[#A95031] mx-auto mb-4" />
          <h3 className="text-2xl font-bold font-serif text-[#221C19] mb-2">Sign in Required</h3>
          <p className="text-sm text-stone-500 mb-6">Please log in to your account to view your study seat bookings.</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-[#A95031] hover:bg-[#8E3F24] text-white font-bold py-3 rounded-full transition shadow-md cursor-pointer text-sm"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();

  // Filter Bookings into 2 Clean Tabs: Upcoming vs Past
  const upcomingBookings = bookings?.filter((b) => {
    const bDate = new Date(b.date);
    return bDate >= new Date(now.setHours(0, 0, 0, 0)) && b.status !== "CANCELLED";
  }) || [];

  const pastBookings = bookings?.filter((b) => {
    const bDate = new Date(b.date);
    return bDate < new Date(now.setHours(0, 0, 0, 0)) || b.status === "COMPLETED" || b.status === "CANCELLED";
  }) || [];

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  // ==========================================
  // VIEW 2: INTERACTIVE BOOKING DETAILS PAGE
  // ==========================================
  if (selectedBooking) {
    const photoUrl =
      selectedBooking.library?.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80";

    const bookingDateFormatted = new Date(selectedBooking.date).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isPast = activeTab === "past" || selectedBooking.status === "COMPLETED";

    return (
      <div className="min-h-screen bg-[#4A0A0D] text-white py-8 px-4 sm:px-6 lg:px-8 select-none font-sans">
        <div className="mx-auto max-w-2xl space-y-6">
          
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedBooking(null)}
              className="bg-white/15 hover:bg-white/25 text-white p-3 rounded-full border border-white/20 transition shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white truncate max-w-xs text-center drop-shadow-sm">
              {selectedBooking.library?.name || "Booking Details"}
            </h1>

            <div className="w-10" />
          </div>

          {/* Featured Image & Header Info */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-2xl space-y-5 text-stone-900">
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-stone-100 shadow-inner">
              <img
                src={photoUrl}
                alt={selectedBooking.library?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-stone-900">Your space</h2>
              <p className="text-sm text-stone-500 font-medium">
                Hosted by {selectedBooking.library?.owner?.name || "Library Host"}
              </p>
              <p className="text-xs text-stone-400 font-semibold">{bookingDateFormatted}</p>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: selectedBooking.library?.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-3 rounded-full transition flex items-center justify-center gap-2 cursor-pointer border border-stone-200/80"
            >
              <Share2 className="w-4 h-4 text-stone-600" />
              <span>Share listing</span>
            </button>
          </div>

          {/* Check-in & Checkout Time Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-2xl flex items-center gap-4 text-stone-900">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
                <DoorOpen className="w-6 h-6 text-[#A95031]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-400 block">Check-in</span>
                <span className="text-sm font-bold text-stone-900 block">
                  {selectedBooking.slotType?.startTime || "08:00 AM"}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">{bookingDateFormatted}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-2xl flex items-center gap-4 text-stone-900">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shrink-0">
                <DoorClosed className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-400 block">Checkout</span>
                <span className="text-sm font-bold text-stone-900 block">
                  {selectedBooking.slotType?.endTime || "11:00 PM"}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">{bookingDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* Digital Access Key Card */}
          <div className="bg-gradient-to-br from-[#1C1715] to-[#2B2320] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4 border border-[#3E322D]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white uppercase tracking-wider">Digital Access Pass</span>
              </div>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                isPast ? "bg-stone-700 text-stone-300" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {isPast ? "Expired" : "Active Pass"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400 block mb-1">Access Key Code:</span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                  {selectedBooking.accessKey || "KEY-874921"}
                </span>
              </div>

              <button
                onClick={() => handleCopyAccessKey(selectedBooking.accessKey || "KEY-874921")}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-full transition flex items-center gap-2 cursor-pointer border border-white/15 shrink-0"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-300" />}
                <span>{copiedKey ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300 border-t border-white/10">
              <div>
                <span className="text-stone-400 block text-[10px]">Slot Timing:</span>
                <span className="font-bold text-white">{selectedBooking.slotType?.name || "Full Day"} ({selectedBooking.slotType?.startTime} - {selectedBooking.slotType?.endTime})</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Reserved Seat:</span>
                <span className="font-bold text-amber-400">Seat {selectedBooking.seat?.seatCode || "S-1"} ({selectedBooking.seat?.seatType || "General"})</span>
              </div>
            </div>
          </div>

          {/* Quick Action Rows */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-2xl space-y-2 text-stone-900">
            
            <div
              onClick={() => router.push("/messages")}
              className="flex items-center gap-4 p-3 rounded-2xl transition cursor-pointer group hover:bg-stone-50"
            >
              <MessageSquare className="w-5 h-5 text-[#A95031] shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#A95031] transition">Message your Host</h4>
                <p className="text-xs text-stone-500">{selectedBooking.library?.owner?.name || "Library Host"}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition" />
            </div>

            <div className="border-t border-stone-100 pt-2 flex items-center gap-4 p-3 rounded-2xl transition">
              <MapPin className="w-5 h-5 text-[#A95031] shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-stone-900 text-sm">Library Location</h4>
                <p className="text-xs text-stone-500">{selectedBooking.library?.address || "Main Branch"}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>

          </div>

          {/* Reservation Details Section */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-2xl space-y-5 text-stone-900">
            <h3 className="text-xl font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">
              Reservation details
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-stone-900 block mb-0.5">Who&apos;s coming / Reserved Slot</span>
                <span className="text-stone-600 block">
                  {selectedBooking.slotType?.name} · Seat {selectedBooking.seat?.seatCode}
                </span>
              </div>

              <div>
                <span className="font-bold text-stone-900 block mb-0.5">Confirmation code</span>
                <span className="font-mono text-stone-800 font-semibold uppercase tracking-wider block">
                  {selectedBooking.accessKey || selectedBooking.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              <div>
                <span className="font-bold text-stone-900 block mb-0.5">Total Paid</span>
                <span className="font-extrabold text-[#A95031] text-base block">
                  ₹{selectedBooking.totalPrice}
                </span>
              </div>

              {selectedBooking.review ? (
                <div className="border-t border-stone-100 pt-3">
                  <span className="font-bold text-stone-900 block mb-0.5">Your Rating & Review</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedBooking.review.rating} / 5</span>
                  </div>
                  {selectedBooking.review.comment && (
                    <p className="text-stone-600 text-xs italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      &quot;{selectedBooking.review.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 block">Leave a Review</span>
                    <span className="text-stone-400 text-xs">Share your experience with other students</span>
                  </div>
                  <button
                    onClick={() => openReviewModal(selectedBooking.libraryId)}
                    className="bg-[#A95031] hover:bg-[#8E3F24] text-white font-bold text-xs px-4 py-2 rounded-full transition cursor-pointer shadow-md"
                  >
                    Rate & Review
                  </button>
                </div>
              )}
            </div>

            {/* Document Actions */}
            <div className="pt-2 space-y-2 border-t border-stone-100">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-between text-xs font-bold text-stone-800 hover:text-[#A95031] py-2 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span>Get a PDF for booking verification</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-between text-xs font-bold text-stone-800 hover:text-[#A95031] py-2 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-stone-500" />
                  <span>Print details</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Rules and Instructions */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-2xl space-y-3 text-stone-900">
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">
              Rules and instructions
            </h3>
            <ul className="space-y-2 text-xs text-stone-600 list-disc list-inside leading-relaxed">
              <li>Strict quiet study zone — please keep mobile devices on silent mode.</li>
              <li>Scan or show your Digital Access Pass key at turnstile for entry.</li>
              <li>Occupy only your assigned seat number ({selectedBooking.seat?.seatCode}).</li>
            </ul>
          </div>

        </div>

        {/* Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
              
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-serif text-[#221C19]">Leave a Review</h3>
              <p className="text-xs text-stone-500">Share your study experience with future students.</p>

              {reviewError && (
                <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl border border-rose-100 font-medium">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-2">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Feedback / Review</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the lighting, quietness, and Wi-Fi speed?"
                    className="w-full text-xs p-3 border border-stone-300 rounded-xl outline-none focus:border-[#A95031] transition bg-white text-stone-900 placeholder:text-stone-400 font-medium"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="bg-[#A95031] hover:bg-[#8E3F24] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW 1: BOOKINGS LIST ("Bookings" instead of "Trips")
  // ==========================================
  return (
    <div className="min-h-screen bg-[#4A0A0D] text-white py-10 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Page Title Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white tracking-tight">
            Bookings
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-light">
            Your reserved study spaces & booking history
          </p>
        </div>

        {/* 2 Filter Tabs (Upcoming vs Past) */}
        <div className="flex items-center justify-center gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white text-[#4A0A0D] shadow-lg font-black"
                : "bg-white/10 text-stone-200 border border-white/20 hover:bg-white/20"
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "past"
                ? "bg-white text-[#4A0A0D] shadow-lg font-black"
                : "bg-white/10 text-stone-200 border border-white/20 hover:bg-white/20"
            }`}
          >
            Past Bookings ({pastBookings.length})
          </button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white/10 border border-white/20 rounded-3xl h-32 w-full shadow-xs" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10 text-rose-200 bg-rose-950/60 rounded-3xl border border-rose-800 font-semibold text-sm">
            Failed to load your booking history. Please verify connection.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayBookings.length === 0 && (
          <div className="text-center py-16 border border-stone-200/80 rounded-3xl bg-white p-8 shadow-2xl max-w-md mx-auto text-stone-900">
            <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-bold font-serif text-stone-900 text-xl mb-1">
              No {activeTab} bookings found
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              {activeTab === "upcoming"
                ? "You don't have any active study seat reservations at this time."
                : "You haven't completed any past study seat reservations yet."}
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => router.push("/")}
                className="bg-[#A95031] hover:bg-[#8E3F24] text-white font-extrabold px-6 py-3 rounded-full text-xs transition shadow-lg cursor-pointer"
              >
                Explore & Book a Space
              </button>
            )}
          </div>
        )}

        {/* Interactive Bookings Cards List */}
        {!isLoading && !error && displayBookings.length > 0 && (
          <div className="space-y-4">
            {displayBookings.map((booking) => {
              const libraryPhoto =
                booking.library?.photos?.[0]?.url ||
                "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80";

              const bookingDateFormatted = new Date(booking.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="group bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-5 shadow-2xl hover:shadow-2xl transition duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-stone-900"
                >
                  <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                    {/* Thumbnail Photo */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 shadow-xs border border-stone-200/60">
                      <img
                        src={libraryPhoto}
                        alt={booking.library?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    {/* Information */}
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#A95031] transition truncate">
                        {booking.library?.name || "StudySpace"}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        {bookingDateFormatted}
                      </p>

                      {/* Logged-in User Initial & Seat Badge */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="w-5 h-5 rounded-full bg-[#A95031]/10 text-[#A95031] text-[10px] font-black flex items-center justify-center border border-[#A95031]/20">
                          {userInitial}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200/60">
                          Seat {booking.seat?.seatCode || "Reserved"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Arrow */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 font-medium block uppercase tracking-wider">Total</span>
                      <span className="text-base font-extrabold text-[#A95031]">₹{booking.totalPrice}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#A95031] text-stone-400 group-hover:text-white flex items-center justify-center transition shadow-xs border border-stone-200">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
