"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    const { data, error } = await supabase
      .from("guests")
      .select(`
        *,
        bookings (
          check_in
        )
      `);

    if (!error && data) {
      const sortedGuests = data
        .map((guest: any) => {
          const latestBooking =
            guest.bookings && guest.bookings.length > 0
              ? guest.bookings.sort(
                  (a: any, b: any) =>
                    new Date(b.check_in).getTime() -
                    new Date(a.check_in).getTime()
                )[0].check_in
              : null;

          return {
            ...guest,
            booked_on: latestBooking,
          };
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.booked_on || 0).getTime() -
            new Date(a.booked_on || 0).getTime()
        );

      setGuests(sortedGuests);
    }
  }

  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      guest.phone
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      guest.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Guest Management
      </h1>

      <input
        className="border p-3 rounded-lg w-full max-w-md mb-6"
        placeholder="Search Guest..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <div className="overflow-x-auto">

        <table className="border-collapse border w-full">

          <thead>

            <tr className="bg-slate-100">

              <th className="border p-3 text-left">
                Name
              </th>

              <th className="border p-3 text-left">
                Booked On
              </th>

              <th className="border p-3 text-left">
                Phone
              </th>

              <th className="border p-3 text-left">
                Email
              </th>

              <th className="border p-3 text-left">
                ID Type
              </th>

              <th className="border p-3 text-left">
                ID Number
              </th>

              <th className="border p-3 text-left">
                Notes
              </th>

              <th className="border p-3 text-left">
                Document
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredGuests.length === 0 ? (

              <tr>
                <td
                  colSpan={8}
                  className="border p-6 text-center text-muted-foreground"
                >
                  No guests found
                </td>
              </tr>

            ) : (

              filteredGuests.map((guest) => (

                <tr
                  key={guest.id}
                  className="hover:bg-slate-50"
                >

                  <td className="border p-3">
                    <a      
                      href={`/guests/${guest.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {guest.full_name}
                    </a>
                  </td>

                  <td className="border p-3">
                    {guest.booked_on
                      ? new Date(guest.booked_on).toLocaleDateString("en-GB")
                      : "-"}
                  </td>

                  <td className="border p-3">
                    {guest.phone || "-"}
                  </td>

                  <td className="border p-3">
                    {guest.email || "-"}
                  </td>

                  <td className="border p-3">
                    {guest.id_type || "-"}
                  </td>

                  <td className="border p-3">
                    {guest.id_number || "-"}
                  </td>

                  <td className="border p-3">
                    {guest.notes || "-"}
                  </td>

                  <td className="border p-3">
                    {guest.document_url ? (
                      <a
                        href={guest.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    ) : (
                      "-"
                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}