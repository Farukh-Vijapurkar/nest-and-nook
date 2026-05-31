"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function BookingProfile() {
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  async function loadBooking() {
    try {
      const { data: bookingData, error } =
        await supabase
          .from("bookings")
          .select(`
            *,
            guests (
              *
            )
          `)
          .eq("id", bookingId)
          .single();

      if (error) {
        console.error(error);
        return;
      }

      setBooking(bookingData);
      setGuest(bookingData.guests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    newStatus: string
  ) {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: newStatus,
      })
      .eq("id", booking.id);

    if (error) {
      alert(error.message);
      return;
    }

    setBooking({
      ...booking,
      status: newStatus,
    });

    alert(
      `Booking marked as ${newStatus}`
    );
  }

  if (loading) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold">
          Loading Booking...
        </h2>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-10">
        <h2 className="text-xl text-red-500">
          Booking Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">
          Booking Details
        </h1>

        <p className="text-muted-foreground mt-2">
          Booking ID: {booking.id}
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-5 gap-6">

        <div className="border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground">
            Amount
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹{booking.total_amount}
          </h2>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground">
            Status
          </p>

          <span
            className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-medium

            ${
              booking.status === "confirmed"
                ? "bg-blue-100 text-blue-700"
                : booking.status === "checked_in"
                ? "bg-green-100 text-green-700"
                : booking.status === "checked_out"
                ? "bg-gray-100 text-gray-700"
                : "bg-red-100 text-red-700"
            }
          `}
          >
            {booking.status}
          </span>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground">
            Check In
          </p>

          <h2 className="text-xl font-bold mt-2">
            {booking.check_in}
          </h2>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground">
            Check Out
          </p>

          <h2 className="text-xl font-bold mt-2">
            {booking.check_out}
          </h2>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground">
            Total Guests
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {booking.guest_count || 1}
          </h2>
        </div>

      </div>

      {/* Status Actions */}

      <div className="flex gap-3 flex-wrap">

        <button
          onClick={() =>
            updateStatus("checked_in")
          }
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Check In
        </button>

        <button
          onClick={() =>
            updateStatus("checked_out")
          }
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800"
        >
          Check Out
        </button>

        <button
          onClick={() =>
            updateStatus("cancelled")
          }
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Cancel Booking
        </button>

      </div>

      {/* Guest Information */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-bold">
            Primary Guest
          </h2>

          <Link
            href={`/guests/${guest?.id}`}
            className="text-blue-600 hover:underline"
          >
            Open Guest Profile →
          </Link>

        </div>

        <div className="mt-6 space-y-3">

          <p>
            <strong>Name:</strong>{" "}
            {guest?.full_name}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {guest?.phone || "-"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {guest?.email || "-"}
          </p>

          <p>
            <strong>ID Type:</strong>{" "}
            {guest?.id_type || "-"}
          </p>

          <p>
            <strong>ID Number:</strong>{" "}
            {guest?.id_number || "-"}
          </p>

        </div>

      </div>

      {/* Additional Guests */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="text-2xl font-bold mb-4">
          Guest Summary
        </h2>

        <p className="mb-4">
          <strong>Total Guests:</strong>{" "}
          {booking.guest_count || 1}
        </p>

        {booking.additional_guests &&
        booking.additional_guests.length > 0 ? (

          <div>

            <h3 className="font-semibold mb-3">
              Additional Guests
            </h3>

            <ul className="space-y-2">

              {booking.additional_guests.map(
                (
                  guestName: string,
                  index: number
                ) => (
                  <li
                    key={index}
                    className="border rounded-lg p-3"
                  >
                    {guestName}
                  </li>
                )
              )}

            </ul>

          </div>

        ) : (

          <p>
            No additional guests
          </p>

        )}

      </div>

      {/* Notes */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="text-2xl font-bold mb-4">
          Notes
        </h2>

        <p>
          {guest?.notes ||
            "No notes available"}
        </p>

      </div>

      {/* Documents */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="text-2xl font-bold mb-4">
          Guest Documents
        </h2>

        {guest?.document_url ? (
          <a
            href={guest.document_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Uploaded Document
          </a>
        ) : (
          <p>
            No document uploaded
          </p>
        )}

      </div>

    </div>
  );
}