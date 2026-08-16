"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("guests")
      .select(`
        *,
        bookings (
          check_in,
          check_out,
          total_amount,
          status
        ),
        guest_documents (
          id,
          document_name,
          document_url,
          document_type
        )
      `);

    console.log("Guests:", data);
    console.log("Guests Error:", error);

    if (!error && data) {
      const sortedGuests = data
        .map((guest: any) => {
          const bookings = guest.bookings || [];

          const latestBooking =
            bookings.length > 0
              ? [...bookings].sort(
                  (a: any, b: any) =>
                    new Date(b.check_in).getTime() -
                    new Date(a.check_in).getTime()
                )[0]
              : null;

          return {
            ...guest,
            booked_on: latestBooking?.check_in || null,
            booking_count: bookings.length,
            documents: guest.guest_documents || [],
          };
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.booked_on || 0).getTime() -
            new Date(a.booked_on || 0).getTime()
        );

      setGuests(sortedGuests);
    }

    setLoading(false);
  }

  const filteredGuests = guests.filter((guest) => {
    const query = search.toLowerCase();

    return (
      guest.full_name?.toLowerCase().includes(query) ||
      guest.phone?.toLowerCase().includes(query) ||
      guest.email?.toLowerCase().includes(query) ||
      guest.id_number?.toLowerCase().includes(query)
    );
  });

  function getInitials(name: string) {
    if (!name) return "?";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  function maskId(idNumber: string) {
    if (!idNumber) return "-";

    const clean = idNumber.replace(/\s/g, "");

    if (clean.length <= 4) {
      return clean;
    }

    return "•••• •••• " + clean.slice(-4);
  }

  function formatDate(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Guest Management
            </h1>

            <p className="text-slate-500 mt-1">
              Manage your guests, stays and identity documents
            </p>
          </div>

          <button
            onClick={loadGuests}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
          >
            ↻ Refresh
          </button>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Guests
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {guests.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                👥
              </div>

            </div>

          </div>


          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  With Documents
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {
                    guests.filter(
                      (guest) => guest.documents?.length > 0
                    ).length
                  }
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                📄
              </div>

            </div>

          </div>


          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Documents
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {guests.reduce(
                    (sum, guest) =>
                      sum + (guest.documents?.length || 0),
                    0
                  )}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                🗂️
              </div>

            </div>

          </div>

        </div>


        {/* SEARCH */}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              placeholder="Search by name, phone, email or ID number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>


        {/* GUEST LIST */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* DESKTOP HEADER */}

          <div className="hidden md:grid grid-cols-[2fr_1.3fr_1.5fr_1.3fr_1fr_100px] gap-4 px-6 py-4 bg-slate-50 border-b text-xs font-semibold uppercase tracking-wide text-slate-500">

            <div>Guest</div>
            <div>Contact</div>
            <div>Identity</div>
            <div>Last Stay</div>
            <div>Documents</div>
            <div></div>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="p-12 text-center text-slate-500">
              Loading guests...
            </div>

          )}


          {/* EMPTY */}

          {!loading && filteredGuests.length === 0 && (

            <div className="p-12 text-center">

              <div className="text-4xl mb-3">
                👤
              </div>

              <p className="font-medium text-slate-700">
                No guests found
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Try changing your search
              </p>

            </div>

          )}


          {/* GUEST ROWS */}

          {!loading &&
            filteredGuests.map((guest) => (

              <div
                key={guest.id}
                className="border-b last:border-b-0 hover:bg-slate-50 transition"
              >

                {/* DESKTOP */}

                <div className="hidden md:grid grid-cols-[2fr_1.3fr_1.5fr_1.3fr_1fr_100px] gap-4 px-6 py-5 items-center">

                  {/* GUEST */}

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                      {getInitials(guest.full_name)}
                    </div>

                    <div>

                      <p className="font-semibold text-slate-900">
                        {guest.full_name}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {guest.booking_count || 0} stay
                        {guest.booking_count !== 1 ? "s" : ""}
                      </p>

                    </div>

                  </div>


                  {/* CONTACT */}

                  <div>

                    <p className="text-sm text-slate-700">
                      {guest.phone || "-"}
                    </p>

                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[170px]">
                      {guest.email || "No email"}
                    </p>

                  </div>


                  {/* IDENTITY */}

                  <div>

                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                      {guest.id_type || "No ID"}
                    </span>

                    <p className="text-xs text-slate-500 mt-2">
                      {maskId(guest.id_number)}
                    </p>

                  </div>


                  {/* LAST STAY */}

                  <div>

                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(guest.booked_on)}
                    </p>

                  </div>


                  {/* DOCUMENTS */}

                  <div>

                    {guest.documents?.length > 0 ? (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        📄 {guest.documents.length}
                      </span>

                    ) : (

                      <span className="text-xs text-slate-400">
                        No documents
                      </span>

                    )}

                  </div>


                  {/* ACTION */}

                  <div className="text-right">

                    <button
                      onClick={() =>
                        setSelectedGuest(guest)
                      }
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-100 transition"
                    >
                      View
                    </button>

                  </div>

                </div>


                {/* MOBILE */}

                <div className="md:hidden p-5">

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                        {getInitials(guest.full_name)}
                      </div>

                      <div>

                        <p className="font-semibold">
                          {guest.full_name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {guest.phone || "No phone"}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setSelectedGuest(guest)
                      }
                      className="text-sm font-medium text-slate-700"
                    >
                      View
                    </button>

                  </div>


                  <div className="grid grid-cols-2 gap-4 mt-5">

                    <div>
                      <p className="text-xs text-slate-400">
                        Last Stay
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {formatDate(guest.booked_on)}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs text-slate-400">
                        Documents
                      </p>

                      <p className="text-sm font-medium mt-1">
                        {guest.documents?.length || 0}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            ))}

        </div>

      </div>


      {/* GUEST DETAILS MODAL */}

      {selectedGuest && (

        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedGuest(null)}
        >

          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="p-6 border-b flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-semibold">
                  {getInitials(selectedGuest.full_name)}
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedGuest.full_name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Guest Profile
                  </p>

                </div>

              </div>

              <button
                onClick={() => setSelectedGuest(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>

            </div>


            {/* CONTACT */}

            <div className="p-6">

              <h3 className="font-semibold text-slate-900 mb-4">
                Contact Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Phone
                  </p>

                  <p className="font-medium mt-1">
                    {selectedGuest.phone || "-"}
                  </p>

                </div>


                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="font-medium mt-1 break-all">
                    {selectedGuest.email || "-"}
                  </p>

                </div>

              </div>


              {/* ID */}

              <h3 className="font-semibold text-slate-900 mt-7 mb-4">
                Identity
              </h3>

              <div className="bg-slate-50 rounded-xl p-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-xs text-slate-400">
                      ID Type
                    </p>

                    <p className="font-medium mt-1">
                      {selectedGuest.id_type || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      ID Number
                    </p>

                    <p className="font-medium mt-1">
                      {maskId(selectedGuest.id_number)}
                    </p>

                  </div>

                </div>

              </div>


              {/* STAYS */}

              <h3 className="font-semibold text-slate-900 mt-7 mb-4">
                Stay History
              </h3>

              {selectedGuest.bookings?.length > 0 ? (

                <div className="space-y-3">

                  {selectedGuest.bookings.map(
                    (booking: any, index: number) => (

                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                      >

                        <div>

                          <p className="font-medium text-slate-800">
                            {formatDate(booking.check_in)}
                            {" → "}
                            {formatDate(booking.check_out)}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            ₹{Number(
                              booking.total_amount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                          {booking.status || "confirmed"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p className="text-sm text-slate-400">
                  No stay history
                </p>

              )}


              {/* DOCUMENTS */}

              <h3 className="font-semibold text-slate-900 mt-7 mb-4">
                Documents
              </h3>

              {selectedGuest.documents?.length > 0 ? (

                <div className="space-y-3">

                  {selectedGuest.documents.map(
                    (document: any) => (

                      <div
                        key={document.id}
                        className="border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            📄
                          </div>

                          <div>

                            <p className="font-medium text-sm">
                              {document.document_name}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {document.document_type || "Document"}
                            </p>

                          </div>

                        </div>


                        {document.document_url && (

                          <a
                            href={document.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition"
                          >
                            View
                          </a>

                        )}

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center">

                  <div className="text-2xl mb-2">
                    📄
                  </div>

                  <p className="text-sm text-slate-500">
                    No documents uploaded
                  </p>

                </div>

              )}


              {/* NOTES */}

              {selectedGuest.notes && (

                <>

                  <h3 className="font-semibold text-slate-900 mt-7 mb-4">
                    Notes
                  </h3>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-slate-700">
                    {selectedGuest.notes}
                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}