"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GuestProfile() {
  const params = useParams();
  const guestId = params.id as string;

  const [guest, setGuest] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (guestId) {
      loadGuest();
    }
  }, [guestId]);

  async function loadGuest() {
    try {
      const { data: guestData, error: guestError } =
        await supabase
          .from("guests")
          .select("*")
          .eq("id", guestId)
          .single();

      if (guestError) {
        console.error(guestError);
        return;
      }

      setGuest(guestData);

      const { data: bookingData, error: bookingError } =
        await supabase
          .from("bookings")
          .select("*")
          .eq("guest_id", guestId)
          .order("created_at", {
            ascending: false,
          });

      if (bookingError) {
        console.error(bookingError);
      }

      setBookings(bookingData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold">
          Loading Guest Profile...
        </h2>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold text-red-500">
          Guest Not Found
        </h2>
      </div>
    );
  }

  const totalRevenue = bookings.reduce(
    (sum, booking) =>
      sum + Number(booking.total_amount || 0),
    0
  );

  return (
    <div className="p-10 space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold">
          {guest.full_name}
        </h1>

        <p className="text-muted-foreground mt-2">
          Guest Profile
        </p>
      </div>

      {/* Top Cards */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="border rounded-2xl p-6 shadow-sm">

          <h2 className="font-bold text-lg mb-4">
            Contact Details
          </h2>

          <p>
            <strong>Phone:</strong>{" "}
            {guest.phone || "-"}
          </p>

          <p className="mt-2">
            <strong>Email:</strong>{" "}
            {guest.email || "-"}
          </p>

        </div>

        <div className="border rounded-2xl p-6 shadow-sm">

          <h2 className="font-bold text-lg mb-4">
            Identity Details
          </h2>

          <p>
            <strong>ID Type:</strong>{" "}
            {guest.id_type || "-"}
          </p>

          <p className="mt-2">
            <strong>ID Number:</strong>{" "}
            {guest.id_number || "-"}
          </p>

        </div>

        <div className="border rounded-2xl p-6 shadow-sm">

          <h2 className="font-bold text-lg mb-4">
            Revenue Generated
          </h2>

          <p className="text-4xl font-bold">
            ₹{totalRevenue}
          </p>

        </div>

      </div>

      {/* Notes */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="font-bold text-lg mb-4">
          Notes
        </h2>

        <p>
          {guest.notes || "No notes available"}
        </p>

      </div>

      {/* Document */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="font-bold text-lg mb-4">
          Uploaded Documents
        </h2>

        {guest.document_url ? (
          <a
            href={guest.document_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Uploaded Document
          </a>
        ) : (
          <p>No document uploaded</p>
        )}

      </div>

      {/* Booking History */}

      <div className="border rounded-2xl p-6 shadow-sm">

        <h2 className="font-bold text-lg mb-4">
          Booking History
        </h2>

        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="space-y-4">

            {bookings.map((booking) => (

              <div
                key={booking.id}
                className="border rounded-xl p-4"
              >

                <div>
                  <strong>Check In:</strong>{" "}
                  {booking.check_in}
                </div>

                <div className="mt-1">
                  <strong>Check Out:</strong>{" "}
                  {booking.check_out}
                </div>

                <div className="mt-1">
                  <strong>Amount:</strong>{" "}
                  ₹{booking.total_amount}
                </div>

                <div className="mt-1">
                  <strong>Status:</strong>{" "}
                  {booking.status}
                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}