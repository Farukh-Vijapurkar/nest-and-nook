"use client";

import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { supabase } from "@/lib/supabase";

import PropertySelector from "@/components/PropertySelector";
import EditBookingDialog from "@/components/bookings/EditBookingDialog";

interface CalendarBooking {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  guest_count: number;

  guests?: {
    full_name?: string;
    phone?: string;
    email?: string;
  };

  property?: {
    id: string;
    name: string;
    address?: string;
  };
}

export default function CalendarPage() {
  const [bookings, setBookings] =
    useState<CalendarBooking[]>([]);

  const [selectedPropertyId, setSelectedPropertyId] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [selectedBooking, setSelectedBooking] =
    useState<CalendarBooking | null>(null);

  /*
   * Booking currently being edited.
   */
  const [editingBooking, setEditingBooking] =
    useState<CalendarBooking | null>(null);

  /*
   * Whether EditBookingDialog is open.
   */
  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  /* =========================================================
     LOAD BOOKINGS
  ========================================================= */

  async function loadBookings() {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name,
          phone,
          email
        ),
        property:properties (
          id,
          name,
          address
        )
      `)
      .order("check_in", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Calendar bookings error:",
        error
      );

      setLoading(false);
      return;
    }

    setBookings(
      (data || []) as CalendarBooking[]
    );

    setLoading(false);
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    void loadBookings();
  }, []);

  /* =========================================================
     FILTER BOOKINGS
  ========================================================= */

  const filteredBookings =
    selectedPropertyId === "all"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.property_id ===
            selectedPropertyId
        );

  /* =========================================================
     FORMAT STATUS
  ========================================================= */

  function getStatusLabel(
    status: string
  ) {
    switch (status) {
      case "confirmed":
        return "Confirmed";

      case "checked_in":
        return "Checked In";

      case "checked_out":
        return "Checked Out";

      case "cancelled":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  }

  /* =========================================================
     EVENT STYLE
  ========================================================= */

  function getEventClass(
    status: string
  ) {
    switch (status) {
      case "confirmed":
        return "calendar-confirmed";

      case "checked_in":
        return "calendar-checked-in";

      case "checked_out":
        return "calendar-checked-out";

      case "cancelled":
        return "calendar-cancelled";

      default:
        return "calendar-default";
    }
  }

  /* =========================================================
     CALENDAR EVENTS
  ========================================================= */

  const calendarEvents =
    filteredBookings.map(
      (booking) => ({
        id: booking.id,

        title:
          booking.guests?.full_name ||
          "Guest",

        start: booking.check_in,

        /*
         * FullCalendar uses an exclusive end date.
         *
         * Example:
         *
         * Check-in 10 Sep
         * Check-out 13 Sep
         *
         * Occupied:
         * 10, 11, 12
         *
         * Available:
         * 13
         */
        end: booking.check_out,

        classNames: [
          getEventClass(
            booking.status
          ),
        ],

        extendedProps: {
          booking,
        },
      })
    );

  /* =========================================================
     EVENT CLICK
  ========================================================= */

  function handleEventClick(
    info: any
  ) {
    const booking =
      info.event.extendedProps
        ?.booking;

    if (booking) {
      setSelectedBooking(
        booking
      );
    }
  }

  /* =========================================================
     OPEN EDIT BOOKING
  ========================================================= */

  function openEditBooking() {
    if (!selectedBooking) {
      return;
    }

    /*
     * Pass the selected booking to
     * EditBookingDialog.
     */
    setEditingBooking(
      selectedBooking
    );

    /*
     * Close details popup.
     */
    setSelectedBooking(null);

    /*
     * Open edit dialog.
     */
    setEditDialogOpen(true);
  }

  /* =========================================================
     AFTER BOOKING UPDATED
  ========================================================= */

  async function handleBookingUpdated() {
    /*
     * Reload bookings so the calendar immediately
     * reflects:
     *
     * - changed dates
     * - changed property
     * - changed amount
     * - changed guest count
     * - changed status
     */
    await loadBookings();

    /*
     * Clear editing state.
     */
    setEditingBooking(null);
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(
    date: string
  ) {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  function formatCurrency(
    amount: number
  ) {
    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    )}`;
  }

  /* =========================================================
     CURRENT VIEW COUNTS
  ========================================================= */

  const activeBookings =
    filteredBookings.filter(
      (booking) =>
        booking.status !==
        "cancelled"
    ).length;

  const cancelledBookings =
    filteredBookings.filter(
      (booking) =>
        booking.status ===
        "cancelled"
    ).length;

  return (
    <div className="min-h-screen bg-[#F8F7F3] p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Booking Calendar
            </h1>

            <p className="text-slate-500 mt-1">
              Manage reservations across your properties
            </p>

          </div>

          <button
            onClick={() =>
              void loadBookings()
            }
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-[#E5DED2] rounded-xl text-sm font-medium text-[#173F35] hover:bg-[#F5F1E9] transition disabled:opacity-50 shadow-sm"
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>


        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-[#E7E0D5] border-l-4 border-l-[#C28A2E] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,25,0.06)]">

            <p className="text-sm text-slate-500">
              Total Bookings
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {filteredBookings.length}
            </p>

          </div>


          <div className="bg-white border border-[#E7E0D5] border-l-4 border-l-[#4F8A65] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,25,0.06)]">

            <p className="text-sm text-slate-500">
              Active Bookings
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {activeBookings}
            </p>

          </div>


          <div className="bg-white border border-[#E7E0D5] border-l-4 border-l-[#C75B55] rounded-2xl p-5 shadow-[0_4px_20px_rgba(60,45,25,0.06)]">

            <p className="text-sm text-slate-500">
              Cancelled
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {cancelledBookings}
            </p>

          </div>

        </div>


        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="bg-white border border-[#E7E0D5] rounded-2xl shadow-[0_6px_25px_rgba(60,45,25,0.06)] p-5 mb-6">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <div>

              <h2 className="font-semibold text-slate-900">
                Calendar View
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Filter the calendar by property or view all units
              </p>

            </div>


            <div className="w-full md:w-80">

              <PropertySelector
                value={
                  selectedPropertyId
                }
                onChange={
                  setSelectedPropertyId
                }
                includeAll
                label="Property / Unit"
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            CALENDAR
        ===================================================== */}

        <div className="bg-white border border-[#E7E0D5] rounded-2xl shadow-[0_6px_25px_rgba(60,45,25,0.06)] p-4 md:p-6">

          <FullCalendar
            plugins={[
              dayGridPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            events={
              calendarEvents
            }
            eventClick={
              handleEventClick
            }
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
            displayEventTime={false}
            fixedWeekCount={false}
          />

        </div>


        {/* =====================================================
            LEGEND
        ===================================================== */}

        <div className="bg-white border border-[#E7E0D5] rounded-2xl shadow-[0_6px_25px_rgba(60,45,25,0.06)] p-5 mt-6">

          <h3 className="font-semibold text-slate-900 mb-4">
            Booking Status
          </h3>

          <div className="flex flex-wrap gap-5 text-sm">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#C28A2E]" />

              <span className="text-slate-600">
                Confirmed
              </span>

            </div>


            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#4F8A65]" />

              <span className="text-slate-600">
                Checked In
              </span>

            </div>


            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#667386]" />

              <span className="text-slate-600">
                Checked Out
              </span>

            </div>


            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-[#C75B55]" />

              <span className="text-slate-600">
                Cancelled
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =======================================================
          BOOKING DETAILS MODAL
      ======================================================= */}

      {selectedBooking && (

        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setSelectedBooking(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Booking Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Reservation information
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>

            </div>


            {/* BODY */}

            <div className="p-6 space-y-5">

              {/* GUEST */}

              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-400">
                  Guest
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {selectedBooking
                    .guests
                    ?.full_name ||
                    "Guest"}
                </p>

                {selectedBooking
                  .guests
                  ?.phone && (

                  <p className="text-sm text-slate-500 mt-1">
                    {
                      selectedBooking
                        .guests
                        .phone
                    }
                  </p>

                )}

                {selectedBooking
                  .guests
                  ?.email && (

                  <p className="text-sm text-slate-500">
                    {
                      selectedBooking
                        .guests
                        .email
                    }
                  </p>

                )}

              </div>


              {/* PROPERTY */}

              <div>

                <p className="text-xs text-slate-400">
                  Property / Unit
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {selectedBooking
                    .property
                    ?.name ||
                    "Unknown Property"}
                </p>

                {selectedBooking
                  .property
                  ?.address && (

                  <p className="text-sm text-slate-500 mt-1">
                    {
                      selectedBooking
                        .property
                        .address
                    }
                  </p>

                )}

              </div>


              {/* DATES */}

              <div className="grid grid-cols-2 gap-4">

                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Check In
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {formatDate(
                      selectedBooking.check_in
                    )}
                  </p>

                </div>


                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Check Out
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {formatDate(
                      selectedBooking.check_out
                    )}
                  </p>

                </div>

              </div>


              {/* BOOKING INFO */}

              <div className="grid grid-cols-2 gap-4">

                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Guests
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {
                      selectedBooking
                        .guest_count
                    }
                  </p>

                </div>


                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-xs text-slate-400">
                    Amount
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {formatCurrency(
                      selectedBooking
                        .total_amount
                    )}
                  </p>

                </div>

              </div>


              {/* STATUS */}

              <div className="flex items-center justify-between border-t pt-5">

                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-700">
                  {getStatusLabel(
                    selectedBooking.status
                  )}
                </span>

              </div>

            </div>


            {/* FOOTER */}

            <div className="px-6 py-4 border-t bg-slate-50 flex justify-between gap-3">

              <button
                onClick={openEditBooking}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Edit Booking
              </button>

              <button
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =======================================================
          EDIT BOOKING DIALOG
      ======================================================= */}

      {editingBooking && (

        <EditBookingDialog
          booking={
            editingBooking
          }
          open={
            editDialogOpen
          }
          onOpenChange={(
            open
          ) => {
            setEditDialogOpen(
              open
            );

            if (!open) {
              setEditingBooking(
                null
              );
            }
          }}
          onUpdated={
            handleBookingUpdated
          }
        />

      )}


      {/* =======================================================
          CALENDAR STYLES
      ======================================================= */}

      <style jsx global>{`

        .fc {
          font-family: inherit;
        }

        .fc-toolbar {
          margin-bottom: 1.5rem !important;
        }

        .fc-toolbar-title {
          font-size: 1.35rem !important;
          font-weight: 700;
          color: #173F35;
          letter-spacing: -0.02em;
        }

        .fc-button {
          background: #173F35 !important;
          border-color: #173F35 !important;
          box-shadow: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 0.55rem 0.8rem !important;
        }

        .fc-button:hover {
          background: #245548 !important;
          border-color: #245548 !important;
        }

        .fc-button-active {
          background: #2D6253 !important;
          border-color: #2D6253 !important;
        }

        .fc-today-button {
          background: #F3EBDD !important;
          border-color: #E4D8C4 !important;
          color: #6B4F25 !important;
        }

        .fc-today-button:hover {
          background: #EDE2D1 !important;
          border-color: #DCCCB3 !important;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #E7E1D7 !important;
        }

        .fc-scrollgrid {
          border-color: #E7E1D7 !important;
          border-radius: 10px !important;
          overflow: hidden;
        }

        .fc-col-header-cell {
          background: #FBFAF7 !important;
        }

        .fc-col-header-cell-cushion {
          color: #7A746A !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 4px !important;
        }

        .fc-daygrid-day-number {
          color: #4A463F !important;
          font-weight: 500;
          padding: 8px !important;
        }

        .fc-day-today {
          background: #FCFAF5 !important;
        }

        .fc-day-today .fc-daygrid-day-number {
          color: #9A6B22 !important;
          font-weight: 700;
        }

        .fc-event {
          border: none !important;
          border-radius: 7px !important;
          padding: 4px 6px !important;
          cursor: pointer;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 5px rgba(40, 35, 25, 0.10);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(40, 35, 25, 0.16);
        }

        .calendar-confirmed {
          background: #C28A2E !important;
          border-color: #C28A2E !important;
          color: white !important;
        }

        .calendar-checked-in {
          background: #4F8A65 !important;
          border-color: #4F8A65 !important;
          color: white !important;
        }

        .calendar-checked-out {
          background: #667386 !important;
          border-color: #667386 !important;
          color: white !important;
        }

        .calendar-cancelled {
          background: #C75B55 !important;
          border-color: #C75B55 !important;
          color: white !important;
          text-decoration: line-through;
          opacity: 0.72;
        }

        .calendar-default {
          background: #7B756B !important;
          border-color: #7B756B !important;
          color: white !important;
        }

        .fc-day-sat,
        .fc-day-sun {
          background: #FCFBF8;
        }

        .fc-day-other .fc-daygrid-day-number {
          color: #B8B2A8 !important;
        }

        .fc-event-title {
          font-weight: 600 !important;
        }

        .fc-daygrid-day:hover {
          background: #FDFBF7 !important;
        }

      `}</style>

    </div>
  );
}