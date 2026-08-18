"use client";

import { Input } from "@/components/ui/input";
import PropertySelector from "@/components/PropertySelector";
import BookingCard from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import BookingForm from "@/components/bookings/BookingForm";
import EditBookingDialog from "@/components/bookings/EditBookingDialog";
import DeleteBookingDialog from "@/components/bookings/DeleteBookingDialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  IndianRupee,
  CalendarDays,
  Users,
  TrendingUp,
  RefreshCw,
  Plus,
  Filter,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
  const [propertyId, setPropertyId] = useState("");

  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  const [additionalGuests, setAdditionalGuests] =
    useState<string[]>([]);

  const [notes, setNotes] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [documentFiles, setDocumentFiles] =
    useState<File[]>([]);

  const [amount, setAmount] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);

  const [dateConflict, setDateConflict] =
    useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editingBooking, setEditingBooking] =
    useState<any>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [deletingBooking, setDeletingBooking] =
    useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [invalidDateRange, setInvalidDateRange] =
    useState(false);

  const [loading, setLoading] = useState(false);

  /*
   * Load bookings
   */

  async function loadBookings(
    startDate?: string,
    endDate?: string
  ) {
    let query = supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name,
          phone,
          email,
          document_url
        ),
        property:properties (
          id,
          name,
          address
        )
      `);

    if (startDate) {
      query = query.gte(
        "check_in",
        startDate
      );
    }

    if (endDate) {
      query = query.lte(
        "check_in",
        endDate
      );
    }

    const {
      data,
      error,
    } = await query.order(
      "check_in",
      {
        ascending: false,
      }
    );

    if (error) {
      console.error(
        "Error loading bookings:",
        error
      );
      return;
    }

    setBookings(data || []);
  }

  /*
   * Refresh bookings
   */

  async function fetchBookings() {
    await loadBookings(
      fromDate,
      toDate
    );
  }

  /*
   * Check availability
   */

  async function checkAvailability(
    startDate: string,
    endDate: string
  ) {
    if (!startDate || !endDate) {
      setDateConflict(false);
      setInvalidDateRange(false);
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      setInvalidDateRange(true);
      setDateConflict(false);
      return;
    }

    setInvalidDateRange(false);

    if (!propertyId) {
      setDateConflict(false);
      return;
    }

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq(
        "property_id",
        propertyId
      )
      .neq(
        "status",
        "cancelled"
      );

    const overlap =
      data?.some(
        (booking) =>
          booking.status !==
            "cancelled" &&
          startDate <
            booking.check_out &&
          endDate >
            booking.check_in
      );

    setDateConflict(
      Boolean(overlap)
    );
  }

  /*
   * Initial load
   */

  useEffect(() => {
    const today = new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];

    const lastDay =
      new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

    setFromDate(firstDay);
    setToDate(lastDay);

    void loadBookings(
      firstDay,
      lastDay
    );
  }, []);

  /*
   * Add booking
   */

  async function addBooking() {
    if (!propertyId) {
      alert(
        "Please select a property / unit."
      );
      return;
    }

    if (!guestName.trim()) {
      alert(
        "Please enter guest name."
      );
      return;
    }

    if (!checkIn || !checkOut) {
      alert(
        "Please select check-in and check-out dates."
      );
      return;
    }

    if (
      new Date(checkOut) <=
      new Date(checkIn)
    ) {
      alert(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (!amount || Number(amount) < 0) {
      alert(
        "Please enter a valid booking amount."
      );
      return;
    }

    if (dateConflict) {
      alert(
        "Selected dates are already booked."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Check overlapping bookings
       */

      const {
        data: existingBookings,
      } = await supabase
        .from("bookings")
        .select("*")
        .eq(
          "property_id",
          propertyId
        )
        .neq(
          "status",
          "cancelled"
        );

      const overlap =
        existingBookings?.some(
          (booking) =>
            booking.status !==
              "cancelled" &&
            checkIn <
              booking.check_out &&
            checkOut >
              booking.check_in
        );

      if (overlap) {
        alert(
          "Selected dates are already booked."
        );

        setLoading(false);
        return;
      }

      /*
       * Upload guest documents
       */

      const uploadedDocuments: {
        name: string;
        url: string;
      }[] = [];

      for (const file of documentFiles) {
        const fileName = `${Date.now()}-${file.name}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            "guest-documents"
          )
          .upload(
            fileName,
            file
          );

        if (uploadError) {
          alert(
            uploadError.message
          );

          setLoading(false);
          return;
        }

        const { data } =
          supabase.storage
            .from(
              "guest-documents"
            )
            .getPublicUrl(
              fileName
            );

        uploadedDocuments.push({
          name: file.name,
          url: data.publicUrl,
        });
      }

      /*
       * Create guest
       */

      const {
        data: guest,
        error: guestError,
      } = await supabase
        .from("guests")
        .insert([
          {
            full_name:
              guestName.trim(),

            phone,

            email,

            notes,

            id_type:
              idType,

            id_number:
              idNumber,

            document_url:
              null,
          },
        ])
        .select()
        .single();

      if (guestError) {
        alert(
          guestError.message
        );

        setLoading(false);
        return;
      }

      if (!guest) {
        alert(
          "Failed to create guest."
        );

        setLoading(false);
        return;
      }

      /*
       * Save guest documents
       */

      for (const doc of uploadedDocuments) {
        const {
          error,
        } = await supabase
          .from(
            "guest_documents"
          )
          .insert({
            guest_id:
              guest.id,

            document_name:
              doc.name,

            document_url:
              doc.url,

            document_type:
              "Other",
          });

        if (error) {
          alert(
            error.message
          );

          setLoading(false);
          return;
        }
      }

      /*
       * Create booking
       */

      const {
        error: bookingError,
      } = await supabase
        .from("bookings")
        .insert([
          {
            property_id:
              propertyId,

            guest_id:
              guest.id,

            check_in:
              checkIn,

            check_out:
              checkOut,

            total_amount:
              Number(amount),

            status:
              "confirmed",

            guest_count:
              guestCount,

            additional_guests:
              additionalGuests,
          },
        ]);

      if (bookingError) {
        alert(
          bookingError.message
        );

        setLoading(false);
        return;
      }

      /*
       * Reset form
       */

      setGuestName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setIdType("");
      setIdNumber("");
      setDocumentFiles([]);
      setGuestCount(1);
      setAdditionalGuests([]);
      setAmount("");
      setCheckIn("");
      setCheckOut("");
      setDateConflict(false);
      setInvalidDateRange(false);

      /*
       * Refresh
       */

      await loadBookings(
        fromDate,
        toDate
      );

      alert(
        "Booking Added Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unexpected Error"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Statistics
   */

  const revenue =
    bookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.total_amount || 0
        ),
      0
    );

  const totalGuests =
    bookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.guest_count || 1
        ),
      0
    );

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status !==
        "cancelled"
    );

  /*
   * Keep these values for the
   * Operations section.
   *
   * They are NOT displayed as
   * top KPI cards.
   */

  const cancelled =
    bookings.filter(
      (booking) =>
        booking.status ===
        "cancelled"
    ).length;

  const checkedIn =
    bookings.filter(
      (booking) =>
        booking.status ===
        "checked_in"
    ).length;

  const checkedOut =
    bookings.filter(
      (booking) =>
        booking.status ===
        "checked_out"
    ).length;

  const currentMonth =
    new Date().toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div className="min-h-screen bg-[#F7F6F2]">

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* HEADER */}

        <section className="relative overflow-hidden rounded-3xl bg-[#0F0F10] text-white shadow-[0_12px_40px_rgba(15,15,16,0.15)]">

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#C6A664]/10 blur-3xl" />

          <div className="absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-[#C6A664]/5 blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <Sparkles
                    size={15}
                    className="text-[#C6A664]"
                  />

                  <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C6A664]">
                    Nest & Nook
                  </span>

                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
                  Booking Dashboard
                </h1>

                <p className="mt-2 text-sm text-white/55 max-w-xl">
                  Manage reservations,
                  guests and booking
                  performance from one
                  place.
                </p>

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <Button
                  variant="outline"
                  onClick={() =>
                    loadBookings(
                      fromDate,
                      toDate
                    )
                  }
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >

                  <RefreshCw
                    size={16}
                    className="mr-2"
                  />

                  Refresh

                </Button>

                <a
                  href="#create-booking"
                  className="inline-flex items-center justify-center rounded-xl bg-[#C6A664] px-5 py-2.5 text-sm font-semibold text-[#0F0F10] hover:bg-[#D5B978] transition"
                >

                  <Plus
                    size={17}
                    className="mr-2"
                  />

                  New Booking

                </a>

              </div>

            </div>

          </div>

        </section>

        {/* FILTER BAR */}

        <section className="rounded-2xl border border-[#E3E1DC] bg-white p-4 sm:p-5 shadow-[0_5px_25px_rgba(35,35,30,0.04)]">

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">

            <div className="flex items-center gap-2 mr-auto">

              <div className="h-9 w-9 rounded-lg bg-[#F4EFE4] flex items-center justify-center">

                <Filter
                  size={17}
                  className="text-[#A88A4A]"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-[#18181B]">
                  Booking Filters
                </p>

                <p className="text-xs text-[#8C877D]">
                  Filter reservations by
                  date
                </p>

              </div>

            </div>

            <div className="grid sm:grid-cols-2 lg:flex gap-3">

              <div>

                <label className="text-xs font-semibold text-[#6F6A62] block mb-1.5">
                  From Date
                </label>

                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                  className="h-10 border-[#DDD9D0] bg-[#FAF9F6]"
                />

              </div>

              <div>

                <label className="text-xs font-semibold text-[#6F6A62] block mb-1.5">
                  To Date
                </label>

                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(
                      e.target.value
                    )
                  }
                  className="h-10 border-[#DDD9D0] bg-[#FAF9F6]"
                />

              </div>

              <div className="flex items-end gap-2">

                <Button
                  disabled={
                    !fromDate ||
                    !toDate
                  }
                  onClick={() =>
                    loadBookings(
                      fromDate,
                      toDate
                    )
                  }
                  className="h-10 bg-[#0F0F10] text-white hover:bg-[#242426]"
                >
                  Apply
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {

                    const today =
                      new Date();

                    const firstDay =
                      new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      )
                        .toISOString()
                        .split(
                          "T"
                        )[0];

                    const lastDay =
                      new Date(
                        today.getFullYear(),
                        today.getMonth() + 1,
                        0
                      )
                        .toISOString()
                        .split(
                          "T"
                        )[0];

                    setFromDate(
                      firstDay
                    );

                    setToDate(
                      lastDay
                    );

                    void loadBookings(
                      firstDay,
                      lastDay
                    );

                  }}
                  className="h-10 border-[#D8D3C9]"
                >
                  Reset
                </Button>

              </div>

            </div>

          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#EEECE7]">

            <Button
              variant="outline"
              size="sm"
              onClick={() => {

                const today =
                  new Date()
                    .toISOString()
                    .split("T")[0];

                setFromDate(
                  today
                );

                setToDate(
                  today
                );

                void loadBookings(
                  today,
                  today
                );

              }}
              className="border-[#D8D3C9] hover:border-[#C6A664] hover:text-[#9A7B3D]"
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {

                const today =
                  new Date();

                const firstDay =
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  )
                    .toISOString()
                    .split(
                      "T"
                    )[0];

                const lastDay =
                  new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0
                  )
                    .toISOString()
                    .split(
                      "T"
                    )[0];

                setFromDate(
                  firstDay
                );

                setToDate(
                  lastDay
                );

                void loadBookings(
                  firstDay,
                  lastDay
                );

              }}
              className="border-[#D8D3C9] hover:border-[#C6A664] hover:text-[#9A7B3D]"
            >
              This Month
            </Button>

          </div>

        </section>

        {/* KPI CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          <StatCard
            title="Revenue"
            value={`₹${revenue.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            caption={currentMonth}
            icon={
              <IndianRupee
                size={18}
              />
            }
            dark
          />

          <StatCard
            title="Bookings"
            value={String(
              bookings.length
            )}
            caption="Reservations"
            icon={
              <CalendarDays
                size={18}
              />
            }
          />

          <StatCard
            title="Guests"
            value={String(
              totalGuests
            )}
            caption="Total guests"
            icon={
              <Users
                size={18}
              />
            }
          />

        </div>

        {/* OPERATIONS + PROPERTY */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* OPERATIONS */}

          <Card className="border-[#E3E1DC] bg-white shadow-[0_5px_25px_rgba(35,35,30,0.04)] rounded-3xl">

            <CardHeader>

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-[#F4EFE4] flex items-center justify-center">

                  <CalendarDays
                    size={19}
                    className="text-[#A88A4A]"
                  />

                </div>

                <div>

                  <CardTitle className="text-lg">
                    Operations
                  </CardTitle>

                  <p className="text-xs text-[#8C877D] mt-1">
                    Booking activity
                  </p>

                </div>

              </div>

            </CardHeader>

            <CardContent className="space-y-3">

              <OperationRow
                label="Active Bookings"
                value={
                  activeBookings.length
                }
              />

              <OperationRow
                label="Today's Check-ins"
                value={
                  checkedIn
                }
              />

              <OperationRow
                label="Today's Check-outs"
                value={
                  checkedOut
                }
              />

              <OperationRow
                label="Cancelled"
                value={
                  cancelled
                }
                danger={
                  cancelled > 0
                }
              />

            </CardContent>

          </Card>

          {/* LATEST GUEST */}

          <Card className="border-[#E3E1DC] bg-white shadow-[0_5px_25px_rgba(35,35,30,0.04)] rounded-3xl">

            <CardHeader>

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-[#F4EFE4] flex items-center justify-center">

                  <Users
                    size={19}
                    className="text-[#A88A4A]"
                  />

                </div>

                <div>

                  <CardTitle className="text-lg">
                    Latest Guest
                  </CardTitle>

                  <p className="text-xs text-[#8C877D] mt-1">
                    Most recent reservation
                  </p>

                </div>

              </div>

            </CardHeader>

            <CardContent>

              <p className="text-2xl font-semibold text-[#0F0F10]">

                {bookings[0]
                  ?.guests
                  ?.full_name ||
                  "—"}

              </p>

              <p className="mt-2 text-sm text-[#777269]">

                {bookings[0]
                  ?.guests
                  ?.phone ||
                  "No phone number"}

              </p>

              <div className="mt-6 rounded-xl bg-[#F7F6F2] border border-[#E9E6DF] p-4">

                <p className="text-xs text-[#8C877D]">
                  Property / Unit
                </p>

                <p className="mt-1 font-semibold text-sm">
                  {bookings[0]
                    ?.property
                    ?.name ||
                    "—"}
                </p>

              </div>

            </CardContent>

          </Card>

          {/* LATEST BOOKING */}

          <Card className="border-[#E3E1DC] bg-[#0F0F10] text-white shadow-[0_10px_30px_rgba(15,15,16,0.12)] rounded-3xl">

            <CardHeader>

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-[#C6A664]/10 flex items-center justify-center">

                  <IndianRupee
                    size={19}
                    className="text-[#C6A664]"
                  />

                </div>

                <div>

                  <CardTitle className="text-lg text-white">
                    Latest Booking
                  </CardTitle>

                  <p className="text-xs text-white/45 mt-1">
                    Most recent reservation
                  </p>

                </div>

              </div>

            </CardHeader>

            <CardContent>

              <p className="text-3xl font-semibold text-[#C6A664]">

                ₹
                {Number(
                  bookings[0]
                    ?.total_amount ||
                    0
                ).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}

              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3">

                  <p className="text-[11px] text-white/40">
                    Check In
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {bookings[0]
                      ?.check_in ||
                      "—"}
                  </p>

                </div>

                <div className="rounded-xl bg-white/[0.06] border border-white/10 p-3">

                  <p className="text-[11px] text-white/40">
                    Check Out
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {bookings[0]
                      ?.check_out ||
                      "—"}
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

        {/* CREATE BOOKING */}

        <div
          id="create-booking"
          className="grid lg:grid-cols-3 gap-6"
        >

          <div className="lg:col-span-2">

            <Card className="border-[#E3E1DC] bg-white shadow-[0_5px_25px_rgba(35,35,30,0.04)] rounded-3xl overflow-hidden">

              <CardHeader className="border-b border-[#EEECE7] bg-[#FCFBF9]">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-[#0F0F10] flex items-center justify-center">

                    <Plus
                      size={19}
                      className="text-[#C6A664]"
                    />

                  </div>

                  <div>

                    <CardTitle className="text-xl">
                      Create New Booking
                    </CardTitle>

                    <p className="text-sm text-[#8C877D] mt-1">
                      Add guest details and
                      booking information.
                    </p>

                  </div>

                </div>

              </CardHeader>

              <CardContent className="p-5 sm:p-7">

                <BookingForm
                  propertyId={
                    propertyId
                  }
                  setPropertyId={
                    setPropertyId
                  }
                  guestName={
                    guestName
                  }
                  setGuestName={
                    setGuestName
                  }
                  phone={
                    phone
                  }
                  setPhone={
                    setPhone
                  }
                  email={
                    email
                  }
                  setEmail={
                    setEmail
                  }
                  notes={
                    notes
                  }
                  setNotes={
                    setNotes
                  }
                  idType={
                    idType
                  }
                  setIdType={
                    setIdType
                  }
                  idNumber={
                    idNumber
                  }
                  setIdNumber={
                    setIdNumber
                  }
                  amount={
                    amount
                  }
                  setAmount={
                    setAmount
                  }
                  checkIn={
                    checkIn
                  }
                  setCheckIn={
                    setCheckIn
                  }
                  checkOut={
                    checkOut
                  }
                  setCheckOut={
                    setCheckOut
                  }
                  guestCount={
                    guestCount
                  }
                  setGuestCount={
                    setGuestCount
                  }
                  additionalGuests={
                    additionalGuests
                  }
                  setAdditionalGuests={
                    setAdditionalGuests
                  }
                  documentFiles={
                    documentFiles
                  }
                  setDocumentFiles={
                    setDocumentFiles
                  }
                  dateConflict={
                    dateConflict
                  }
                  invalidDateRange={
                    invalidDateRange
                  }
                  checkAvailability={
                    checkAvailability
                  }
                  submitLabel={
                    loading
                      ? "Saving..."
                      : "Create Booking"
                  }
                  onSubmit={
                    addBooking
                  }
                />

              </CardContent>

            </Card>

          </div>

          {/* SIDE SUMMARY */}

          <Card className="border-[#E3E1DC] bg-[#0F0F10] text-white rounded-3xl shadow-[0_10px_30px_rgba(15,15,16,0.12)]">

            <CardHeader>

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-[#C6A664]/10 flex items-center justify-center">

                  <Sparkles
                    size={19}
                    className="text-[#C6A664]"
                  />

                </div>

                <div>

                  <CardTitle className="text-white">
                    Booking Summary
                  </CardTitle>

                  <p className="text-xs text-white/45 mt-1">
                    Current filtered period
                  </p>

                </div>

              </div>

            </CardHeader>

            <CardContent className="space-y-4">

              <DarkSummaryRow
                label="Total bookings"
                value={String(
                  bookings.length
                )}
              />

              <DarkSummaryRow
                label="Active"
                value={String(
                  activeBookings.length
                )}
              />

              <DarkSummaryRow
                label="Guests"
                value={String(
                  totalGuests
                )}
              />

              <DarkSummaryRow
                label="Revenue"
                value={`₹${revenue.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }
                )}`}
                gold
              />

              <div className="pt-4 border-t border-white/10">

                <p className="text-xs text-white/40">
                  Selected period
                </p>

                <p className="mt-2 text-sm font-medium">
                  {fromDate || "—"}
                  {" "}
                  →
                  {" "}
                  {toDate || "—"}
                </p>

              </div>

            </CardContent>

          </Card>

        </div>

        {/* RECENT BOOKINGS */}

        <section className="pt-2">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#C6A664]" />

                <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#A88A4A]">
                  Reservations
                </span>

              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-[#0F0F10] mt-1">
                Recent Bookings
              </h2>

              <p className="text-sm text-[#8C877D] mt-1">
                Latest reservations for
                the selected period.
              </p>

            </div>

            <div className="rounded-xl border border-[#E3E1DC] bg-white px-4 py-2 text-sm text-[#777269]">
              {bookings.length}{" "}
              bookings
            </div>

          </div>

          {bookings.length === 0 ? (

            <div className="rounded-3xl border border-[#E3E1DC] bg-white p-12 text-center">

              <CalendarDays
                size={42}
                className="mx-auto text-[#C6A664]"
              />

              <h3 className="mt-4 text-lg font-semibold">
                No bookings found
              </h3>

              <p className="mt-1 text-sm text-[#8C877D]">
                Try changing the date
                filter or create a new
                booking.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

              {bookings.map(
                (booking) => (

                  <BookingCard
                    key={
                      booking.id
                    }
                    booking={
                      booking
                    }
                    propertyName={
                      booking
                        .property
                        ?.name
                    }
                    onEdit={(
                      selectedBooking
                    ) => {
                      setEditingBooking(
                        selectedBooking
                      );

                      setEditOpen(
                        true
                      );
                    }}
                    onDelete={(
                      selectedBooking
                    ) => {
                      setDeletingBooking(
                        selectedBooking
                      );

                      setDeleteOpen(
                        true
                      );
                    }}
                  />

                )
              )}

            </div>

          )}

        </section>

        {/* DIALOGS */}

        <EditBookingDialog
          booking={
            editingBooking
          }
          open={
            editOpen
          }
          onOpenChange={
            setEditOpen
          }
          onUpdated={
            fetchBookings
          }
        />

        <DeleteBookingDialog
          booking={
            deletingBooking
          }
          open={
            deleteOpen
          }
          onOpenChange={
            setDeleteOpen
          }
          onDeleted={
            fetchBookings
          }
        />

      </div>

    </div>
  );
}

/*
 * ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  title,
  value,
  caption,
  icon,
  dark = false,
}: {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_5px_20px_rgba(35,35,30,0.04)] ${
        dark
          ? "bg-[#0F0F10] border-[#0F0F10] text-white"
          : "bg-white border-[#E3E1DC]"
      }`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`text-sm ${
            dark
              ? "text-white/55"
              : "text-[#777269]"
          }`}
        >
          {title}
        </span>

        <span
          className={
            dark
              ? "text-[#C6A664]"
              : "text-[#A88A4A]"
          }
        >
          {icon}
        </span>

      </div>

      <p
        className={`mt-4 text-2xl sm:text-3xl font-semibold tracking-tight ${
          dark
            ? "text-white"
            : "text-[#0F0F10]"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-1 text-xs ${
          dark
            ? "text-white/40"
            : "text-[#969087]"
        }`}
      >
        {caption}
      </p>

    </div>
  );
}

/*
 * ============================================================
 * OPERATION ROW
 * ============================================================
 */

function OperationRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E9E6DF] bg-[#FAF9F6] px-4 py-3">

      <span className="text-sm text-[#6F6A62]">
        {label}
      </span>

      <span
        className={`font-semibold ${
          danger
            ? "text-[#B34B43]"
            : "text-[#18181B]"
        }`}
      >
        {value}
      </span>

    </div>
  );
}

/*
 * ============================================================
 * DARK SUMMARY ROW
 * ============================================================
 */

function DarkSummaryRow({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-white/50">
        {label}
      </span>

      <span
        className={`font-semibold ${
          gold
            ? "text-[#C6A664]"
            : "text-white"
        }`}
      >
        {value}
      </span>

    </div>
  );
}