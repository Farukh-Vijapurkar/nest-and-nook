"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [documentFile, setDocumentFile] =
    useState<File | null>(null);

  const [amount, setAmount] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [bookings, setBookings] = useState<any[]>([]);

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

  useEffect(() => {
    loadBookings();
  }, []);

  async function addBooking() {
    try {
      let documentUrl = "";

      if (documentFile) {
        const fileName =
          `${Date.now()}-${documentFile.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("guest-documents")
            .upload(fileName, documentFile);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data } =
          supabase.storage
            .from("guest-documents")
            .getPublicUrl(fileName);

        documentUrl = data.publicUrl;
      }

      const { data: property } =
        await supabase
          .from("properties")
          .select("*")
          .limit(1)
          .single();

      if (!property) {
        alert("Property not found");
        return;
      }

      const { data: guest } =
        await supabase
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

      const { error } =
        await supabase
          .from("bookings")
          .insert([
            {
              property_id: property.id,
              guest_id: guest.id,
              check_in: checkIn,
              check_out: checkOut,
              total_amount: Number(amount),
              status: "confirmed",
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

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Bookings
      </h1>

      <div className="flex flex-col gap-4 max-w-xl">

        <input
          className="border p-2 rounded"
          placeholder="Guest Name"
          value={guestName}
          onChange={(e) =>
            setGuestName(e.target.value)
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="ID Type"
          value={idType}
          onChange={(e) =>
            setIdType(e.target.value)
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) =>
            setIdNumber(e.target.value)
          }
        />

        <textarea
          className="border p-2 rounded"
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <input
          type="file"
          className="border p-2 rounded"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setDocumentFile(
                e.target.files[0]
              );
            }
          }}
        />

        <input
          className="border p-2 rounded"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <label>Check In Date</label>

        <input
          className="border p-2 rounded"
          type="date"
          value={checkIn}
          onChange={(e) =>
            setCheckIn(e.target.value)
          }
        />

        <label>Check Out Date</label>

        <input
          className="border p-2 rounded"
          type="date"
          value={checkOut}
          onChange={(e) =>
            setCheckOut(e.target.value)
          }
        />

        <button
          onClick={addBooking}
          className="bg-black text-white p-2 rounded"
        >
          Save Booking
        </button>

      </div>

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Booking List
        </h2>

        <table className="border-collapse border w-full">

          <thead>
            <tr>
              <th className="border p-2">
                Guest
              </th>

              <th className="border p-2">
                Phone
              </th>

              <th className="border p-2">
                Email
              </th>

              <th className="border p-2">
                Check In
              </th>

              <th className="border p-2">
                Check Out
              </th>

              <th className="border p-2">
                Amount
              </th>

              <th className="border p-2">
                Document
              </th>
            </tr>
          </thead>

          <tbody>

            {bookings.map((booking) => (
              <tr key={booking.id}>

                <td className="border p-2">
                  {booking.guests?.full_name}
                </td>

                <td className="border p-2">
                  {booking.guests?.phone}
                </td>

                <td className="border p-2">
                  {booking.guests?.email}
                </td>

                <td className="border p-2">
                  {booking.check_in}
                </td>

                <td className="border p-2">
                  {booking.check_out}
                </td>

                <td className="border p-2">
                  ₹{booking.total_amount}
                </td>

                <td className="border p-2">
                  {booking.guests?.document_url ? (
                    <a
                      href={
                        booking.guests.document_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}