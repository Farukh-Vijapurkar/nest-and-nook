"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function loadGuests() {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error && data) {
      setGuests(data);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

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
        className="border p-2 rounded w-full max-w-md mb-6"
        placeholder="Search Guest..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <table className="border-collapse border w-full">

        <thead>
          <tr>

            <th className="border p-2">
              Name
            </th>

            <th className="border p-2">
              Phone
            </th>

            <th className="border p-2">
              Email
            </th>

            <th className="border p-2">
              ID Type
            </th>

            <th className="border p-2">
              ID Number
            </th>

            <th className="border p-2">
              Notes
            </th>

            <th className="border p-2">
              Document
            </th>

          </tr>
        </thead>

        <tbody>

          {filteredGuests.map((guest) => (
            <tr key={guest.id}>

              <td className="border p-2">
                {guest.full_name}
              </td>

              <td className="border p-2">
                {guest.phone}
              </td>

              <td className="border p-2">
                {guest.email}
              </td>

              <td className="border p-2">
                {guest.id_type}
              </td>

              <td className="border p-2">
                {guest.id_number}
              </td>

              <td className="border p-2">
                {guest.notes}
              </td>

              <td className="border p-2">

                {guest.document_url ? (
                  <a
                    href={guest.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Document
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
  );
}