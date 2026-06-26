"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  IndianRupee,
  CalendarDays,
  Users,
  UserCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [additionalGuests, setAdditionalGuests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [amount, setAmount] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [dateConflict, setDateConflict] = useState(false);
  const [invalidDateRange, setInvalidDateRange] = useState(false); // ✅ NEW

  async function loadBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        guests (
          full_name,
          phone,
          email,
          document_url
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
  }

  async function checkAvailability(
    startDate: string,
    endDate: string
  ) {
    if (!startDate || !endDate) {
      setDateConflict(false);
      setInvalidDateRange(false); // ✅
      return;
    }

    // ✅ NEW: Validate date range first
    if (new Date(endDate) < new Date(startDate)) {
      setInvalidDateRange(true);
      setDateConflict(false);
      return;
    }

    setInvalidDateRange(false); // ✅ Clear if valid

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .neq("status", "cancelled");

    const overlap = data?.some(
      (booking) =>
        new Date(startDate) <= new Date(booking.check_out) &&
        new Date(endDate) >= new Date(booking.check_in)
    );

    setDateConflict(Boolean(overlap));
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function addBooking() {
    try {
      let documentUrl = "";

      if (documentFile) {
        const fileName = `${Date.now()}-${documentFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-documents")
          .upload(fileName, documentFile);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from("guest-documents")
          .getPublicUrl(fileName);

        documentUrl = data.publicUrl;
      }

      const { data: property } = await supabase
        .from("properties")
        .select("*")
        .limit(1)
        .single();

      if (!property) {
        alert("Property not found");
        return;
      }

      const { data: guest } = await supabase
        .from("guests")
        .insert([
          {
            full_name: guestName,
            phone,
            email,
            notes,
            id_type: idType,
            id_number: idNumber,
            document_url: documentUrl,
          },
        ])
        .select()
        .single();

      if (!guest) {
        alert("Failed to create guest");
        return;
      }

      // ✅ Overlap check
      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("*")
        .neq("status", "cancelled");

      const overlap = existingBookings?.some(
        (booking) =>
          new Date(checkIn) <= new Date(booking.check_out) &&
          new Date(checkOut) >= new Date(booking.check_in)
      );

      if (overlap) {
        alert("Selected dates are already booked.");
        return;
      }

      const { error } = await supabase.from("bookings").insert([
        {
          property_id: property.id,
          guest_id: guest.id,
          check_in: checkIn,
          check_out: checkOut,
          total_amount: Number(amount),
          status: "confirmed",
          guest_count: guestCount,
          additional_guests: additionalGuests,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }

      setGuestName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setIdType("");
      setIdNumber("");
      setDocumentFile(null);
      setGuestCount(1);
      setAdditionalGuests([]);
      setAmount("");
      setCheckIn("");
      setCheckOut("");

      await loadBookings();
      alert("Booking Added Successfully");
    } catch (error) {
      console.error(error);
      alert("Unexpected Error");
    }
  }

  const revenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_amount || 0),
    0
  );

  const totalGuests = bookings.reduce(
    (sum, booking) => sum + Number(booking.guest_count || 1),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Bookings Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage reservations and guests.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-muted-foreground">Revenue</p>
                <h2 className="text-3xl font-bold">₹{revenue}</h2>
              </div>
              <IndianRupee />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-muted-foreground">Bookings</p>
                <h2 className="text-3xl font-bold">{bookings.length}</h2>
              </div>
              <CalendarDays />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-muted-foreground">Guests</p>
                <h2 className="text-3xl font-bold">{totalGuests}</h2>
              </div>
              <Users />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-muted-foreground">Upcoming</p>
              <h2 className="text-3xl font-bold">
                {
                  bookings.filter(
                    (booking) => booking.status === "confirmed"
                  ).length
                }
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">

        <div className="lg:col-span-2">

          <Card>

            <CardHeader>

              <CardTitle>
                Create New Booking
              </CardTitle>

              <p className="text-muted-foreground">
                Add guest details and booking information.
              </p>

            </CardHeader>

            <CardContent>

              <div className="grid gap-4">

                <h3 className="text-lg font-semibold border-b pb-2">
                  Guest Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">

                  <Input
                    placeholder="Guest Name"
                    value={guestName}
                    onChange={(e) =>
                      setGuestName(e.target.value)
                    }
                  />

                  <Input
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />

                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                  <Input
                    placeholder="ID Type"
                    value={idType}
                    onChange={(e) =>
                      setIdType(e.target.value)
                    }
                  />

                  <Input
                    placeholder="ID Number"
                    value={idNumber}
                    onChange={(e) =>
                      setIdNumber(e.target.value)
                    }
                  />

                  <div>

                    <label className="text-sm font-medium mb-2 block">
                      Number of Guests
                    </label>

                    <Input
                      type="number"
                      value={guestCount}
                      onChange={(e) =>
                        setGuestCount(
                          Number(e.target.value)
                        )
                      }
                    />

                  </div>

                </div>

                {guestCount > 1 && (
                  <div>
                    <label className="block mb-2 font-medium">
                      Additional Guests
                    </label>
                    {Array.from({ length: guestCount - 1 }).map(
                      (_, index) => (
                        <input
                          key={index}
                          className="border p-2 rounded w-full mb-2"
                          placeholder={`Guest ${index + 2} Name`}
                          value={additionalGuests[index] || ""}
                          onChange={(e) => {
                            const updated = [...additionalGuests];
                            updated[index] = e.target.value;
                            setAdditionalGuests(updated);
                          }}
                        />
                      )
                    )}
                  </div>
                )}

                <Textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <h3 className="text-lg font-semibold border-b pb-2 mt-4">
                  Documents
                </h3>

                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setDocumentFile(
                      e.target.files?.[0] || null
                    )
                  }
                />

                <h3 className="text-lg font-semibold border-b pb-2 mt-4">
                  Booking Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">

                  <Input
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                  />

                  <div />

                  <div>

                    <label className="text-sm font-medium mb-2 block">
                      Check In Date
                    </label>

                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCheckIn(value);
                        checkAvailability(value, checkOut);
                      }}
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium mb-2 block">
                      Check Out Date
                    </label>

                    <Input
                      type="date"
                      value={checkOut}
                      min={checkIn} // ✅ Prevents picking before check-in
                      onChange={(e) => {
                        const value = e.target.value;
                        setCheckOut(value);
                        checkAvailability(checkIn, value);
                      }}
                    />

                  </div>

                </div>

                {checkIn && checkOut && (

                  <div className="mt-3">

                    {/* ✅ Three-way render: invalid range → conflict → available */}
                    {invalidDateRange ? (

                      <div
                        className="
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          text-red-700
                          px-4
                          py-3
                        "
                      >
                        ❌ Check-out date cannot be before check-in date
                      </div>

                    ) : dateConflict ? (

                      <div
                        className="
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          text-red-700
                          px-4
                          py-3
                        "
                      >
                        ❌ Property already booked for selected dates
                      </div>

                    ) : (

                      <div
                        className="
                          rounded-xl
                          border
                          border-green-200
                          bg-green-50
                          text-green-700
                          px-4
                          py-3
                        "
                      >
                        ✅ Dates available
                      </div>

                    )}

                  </div>

                )}

                <Button
                  onClick={addBooking}
                  disabled={dateConflict || invalidDateRange} // ✅
                  className="w-full"
                >
                  {/* ✅ Three-way button label */}
                  {invalidDateRange
                    ? "Invalid Dates"
                    : dateConflict
                    ? "Dates Unavailable"
                    : "Save Booking"}
                </Button>

              </div>

            </CardContent>

          </Card>

        </div>

        <Card>

          <CardHeader>
            <CardTitle>
              Operations
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <div>

              <p className="text-sm text-muted-foreground">
                Today's Check-ins
              </p>

              <h3 className="text-3xl font-bold">
                {
                  bookings.filter(
                    (booking) =>
                      booking.status === "checked_in"
                  ).length
                }
              </h3>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Today's Check-outs
              </p>

              <h3 className="text-3xl font-bold">
                {
                  bookings.filter(
                    (booking) =>
                      booking.status === "checked_out"
                  ).length
                }
              </h3>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Latest Guest
              </p>

              <h3 className="font-semibold">
                {
                  bookings[0]?.guests?.full_name ||
                  "-"
                }
              </h3>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Latest Booking
              </p>

              <h3 className="font-semibold">
                ₹{
                  bookings[0]?.total_amount ||
                  0
                }
              </h3>

            </div>

          </CardContent>

        </Card>

      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-6">Recent Bookings</h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.guests?.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.guest_count || 1} Guest(s)
                      </p>
                    </div>
                    <Badge
                      className={
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "checked_in"
                          ? "bg-blue-100 text-blue-700"
                          : booking.status === "checked_out"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>

                  <div className="flex items-center gap-3 mb-4">

                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle2 className="h-5 w-5" />
                    </div>

                    <div>

                      <p className="font-semibold">
                        {booking.guests?.full_name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Booking Guest
                      </p>

                    </div>

                  </div>

                  <div className="space-y-3">

                    <div className="flex items-center gap-2">

                      <Users className="h-4 w-4 text-muted-foreground" />

                      <span>
                        {booking.guest_count || 1} Guest(s)
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <CalendarDays className="h-4 w-4 text-muted-foreground" />

                      <span>
                        {booking.check_in}
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      <CalendarDays className="h-4 w-4 text-muted-foreground" />

                      <span>
                        {booking.check_out}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">

                      <IndianRupee className="h-4 w-4" />

                      <span className="font-bold text-lg">
                        {booking.total_amount}
                      </span>

                    </div>

                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}